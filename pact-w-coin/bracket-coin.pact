(module bracket-coin BRACKETS-GOVERNANCE

  (defun enforce-brackets-admin ()
    (enforce-guard (read-keyset "master-bracket-keyset"))
  )

  (defcap BRACKETS-GOVERNANCE ()
    (enforce-brackets-admin)
  )

  (use coin)

  (defconst CONTRACT_ACCOUNT:string 'master-bracket-keyset)
  (defun contract-guard:guard () (create-module-guard 'master-bracket-keyset))

   ;game initiated, people still signing up
   (defconst INITIATED:string "initiated")
   ;people signed up, game in progress
   (defconst IN_PROGRESS:string "in-progress")
   ;game finished and winner not paid
   (defconst COMPLETE:string "complete")
   ;game finished and winner paid
   (defconst WINNER_PAID:string "winner-paid")
   ;team has no player assigned
   (defconst UNASSIGNED:string "unassigned")

  (defschema empty-bracket
    ;will need to refactor admin to take in a keyset
    ;not sure how to do this from the frontend though...
    admin:string
    bracket:list
    status:string
    moneyPool:integer
    players:[string]
    winner:string
    entryFee:integer
    usernames:[string])
    ;guard:guard

  (deftable empty-bracket-table:{empty-bracket})

  (defschema bracket-betting
    ;will need to refactor admin to take in a keyset
    ;not sure how to do this from the frontend though...
    admin:string
    bracket:list
    status:string
    moneyPool:integer
    players:[string]
    players-bets:list
    winner:string
    entryFee:integer)

  (deftable bracket-betting-table:{bracket-betting})

  (defschema users
    username:string
    balance:integer
    bb-games:list
    bb-admins:list
    eb-games:list
    eb-admins:list
    games-won:list)

  (deftable users-table:{users})

  (defcap BRACKET-ADMIN-BB (admin-key:string bracket-name:string)
    (with-read bracket-betting-table bracket-name { "admin":= admin-key-db }
      (enforce (= admin-key admin-key-db) "you are not the bracket admin")
    )
  )

  (defcap BRACKET-ADMIN-EB (admin-key:string bracket-name:string)
    (with-read empty-bracket-table bracket-name { "admin":= admin-key-db }
      (enforce (= admin-key admin-key-db) "you are not the bracket admin")
    )
  )

  (defcap USER-CAN-TRANSFER (from:string amount:integer)
    (with-read users-table from { "balance" := from-bal }
      (enforce (>= from-bal amount) "Insufficient Funds")
    )
  )

  (defcap EB-CONTRACT-CAN-TRANSFER (bracket-name:string amount:integer)
    (with-read empty-bracket-table bracket-name { "moneyPool" := from-bal }
      (enforce (>= from-bal amount) "Insufficient Funds")
    )
  )

  (defcap BB-CONTRACT-CAN-TRANSFER (bracket-name:string amount:integer)
    (with-read bracket-betting-table bracket-name { "moneyPool" := from-bal }
      (enforce (>= from-bal amount) "Insufficient Funds")
    )
  )

  (defcap IS-REGISTERED-USER (user-key:string)
    (let ((users (keys users-table)))
        (enforce (contains user-key users) "you are not a registered user")
    )
  )

  (defun init-user (user-key:string username:string)
    (insert users-table user-key {
      "username": username,
      "balance": 100,
      "bb-games": [],
      "bb-admins": [],
      "eb-games": [],
      "eb-admins": [],
      "games-won": []
    })
  )

  (defun get-user-info (user-key:string)
    (with-capability (IS-REGISTERED-USER user-key)
        (with-read users-table user-key {
          "username":=username,
          "bb-games":=bb-games,
          "bb-admins":=bb-admins,
          "eb-games":=eb-games,
          "eb-admins":=eb-admins,
          "balance":= balance,
          "games-won":= games-won}
          [username, bb-games, bb-admins, eb-games, eb-admins, balance, games-won]
        )
    )
  )

  (defun get-all-users ()
    ;;anyone can call this
    (keys users-table)
  )

  (defun init-empty-bracket
    (admin-key:string bracket-name:string bracket:list number-players:integer entry-fee:integer)
    "initiate a new bracket"
    ;is already a user of our systems
    (with-capability (IS-REGISTERED-USER admin-key)
      (enforce (check-bracket-validity bracket) "bracket format not valid")
      ; anyone can init a new bracket.
       (insert empty-bracket-table bracket-name {
        ;"admin": (at "sender" (chain-data)),
         "admin": admin-key,
         "bracket": bracket,
         "status": INITIATED,
         "moneyPool": 0,
         "players": (make-list number-players UNASSIGNED),
         "winner": UNASSIGNED,
         "entryFee": entry-fee,
         "usernames": (make-list number-players UNASSIGNED)
       })
       ;insert that this user is an admin for this bracket
       (with-read users-table admin-key {
         "eb-admins":=admins-list}
           (update users-table admin-key {
             "eb-admins": (+ admins-list [bracket-name])
           })
       )
     )
  )


  (defun init-bracket-betting
    (admin-key:string bracket-name:string bracket:list entry-fee:integer)
    "initiate a new bracket"
    ;is already a user of our systems
    (with-capability (IS-REGISTERED-USER admin-key)
        (enforce (check-bracket-validity bracket) "bracket format not valid")
        ; anyone can init a new bracket.
         (insert bracket-betting-table bracket-name {
          ;"admin": (at "sender" (chain-data)),
           "admin": admin-key,
           "bracket": bracket,
           "status": INITIATED,
           "moneyPool": 0,
           "players": [],
           "players-bets": [],
           "winner": UNASSIGNED,
           "entryFee": entry-fee
         })
         ;insert that this user is an admin for this bracket
         (with-read users-table admin-key {
           "bb-admins":=admin-lists}
             (update users-table admin-key {
               "bb-admins": (+ admin-lists [bracket-name])
             })
         )
    )
  )

  (defun get-bb-info (bracket-name:string)
    ;;anyone can call this
    (with-read bracket-betting-table bracket-name {
      "players":= players,
      "players-bets":= players-bets,
      "bracket":= bracket,
      "status":= status,
      "entryFee":= entry-fee,
      "admin":= admin}
      [players, bracket, players-bets, status, entry-fee, admin]
    )
  )

  (defun get-eb-info (bracket-name:string)
    ;;anyone can call this
    (with-read empty-bracket-table bracket-name {
      "players":= players,
      "bracket":= bracket,
      "status":= status,
      "entryFee":= entry-fee,
      "admin":= admin,
      "usernames":=usernames}
      [players, bracket, status, entry-fee, admin, usernames]
    )
  )

  (defun get-brackets-bb ()
    ;;anyone can call this
    (keys bracket-betting-table)
  )

  (defun get-brackets-eb ()
    ;;anyone can call this
    (keys empty-bracket-table)
  )

  (defun enter-tournament-eb
    (bracket-name:string player-key:string player-index:integer)
    (with-capability (IS-REGISTERED-USER player-key)
                ;insert that this user is an admin for this bracket
         (with-read users-table player-key {
           "eb-games":= games-list,
           "username":= username,
           "balance":= balance}

            (with-read empty-bracket-table bracket-name {
              "players":= players,
              "usernames":=usernames,
              "entryFee":= entry-fee,
              "moneyPool":= money-pool}
              ;commented this line out for testing purposes
              (enforce (!= (contains player-key players) true) "you can only enter once")
              (enforce (= (at player-index players) UNASSIGNED) "this spot is not available")

              ;;make the payment here
              ;probably use a pact
              ;dont execute rest of code until tx is confirmed
              (with-capability (USER-CAN-TRANSFER player-key entry-fee)

                  (update users-table player-key {
                   "eb-games": (+ games-list [bracket-name]),
                   "balance": (- balance entry-fee)
                  })
                  (update empty-bracket-table bracket-name {
                    "players": (+ (+ (take player-index players) [player-key]) (take (- (- (- (length players) player-index) 1)) players)),
                    "usernames": (+ (+ (take player-index usernames) [username]) (take (- (- (- (length usernames) player-index) 1)) usernames)),
                    "moneyPool": (+ money-pool entry-fee)
                  })
            )
            (coin.transfer player-key CONTRACT_ACCOUNT (contract-guard) (* entry-fee 1.0))
            )
         )
    )
  )

  (defun test ()
    (let ((tx-data (chain-data)))
      [(at "sender" tx-data)]
    )
  )


  (defun enter-tournament-bb (bracket-name:string player-key:string player-bet:list)
    (with-capability (IS-REGISTERED-USER player-key)
        (with-read users-table player-key {
           "bb-games":=games-list,
           "balance":=balance}
            ;there is not limit to how many people can join as long as they pay the entry fee
            (with-read bracket-betting-table bracket-name {
             "players":= players,
             "players-bets":= players-bets,
             "entryFee":= entry-fee,
             "moneyPool":= money-pool}

             (enforce (!= (contains player-key players) true) "you can only enter once")

            (with-capability (USER-CAN-TRANSFER player-key entry-fee)
            ;;get the payment done here
                  (update bracket-betting-table bracket-name {
                    "players": (+ players [player-key]),
                    "players-bets": (+ players-bets [player-bet]),
                    "moneyPool": (+ money-pool entry-fee)}
                  )

                ;insert that this user is an admin for this bracket

                 (update users-table player-key {
                   "bb-games": (+ games-list [bracket-name]),
                   "balance": (- balance entry-fee)
                 })
            )
            (coin.transfer player-key CONTRACT_ACCOUNT (contract-guard) (* entry-fee 1.0))
        )
         )
    )
  )


  ;when we make the draw, we pass the draw bracket as bracket param
  (defun advance-bracket-eb (admin-key:string bracket-name:string bracket:list)
     ;;check the bracket list validity on the front
     ;maybe some minimal checking here too
     (with-capability (BRACKET-ADMIN-EB admin-key bracket-name)
       (enforce (check-bracket-validity bracket) "bracket format not valid")
       ;;can only be called by admin of that bracket
       (update empty-bracket-table bracket-name {
           "bracket": bracket,
           "status": IN_PROGRESS
       })
    )
  )

  (defun advance-bracket-bb (admin-key:string bracket-name:string bracket:list)
     ;;check the bracket list validity on the front
     ;maybe some minimal checking here too
     (with-capability (BRACKET-ADMIN-BB admin-key bracket-name)
       (enforce (check-bracket-validity bracket) "bracket format not valid")
       ;;can only be called by admin of that bracket
       (update bracket-betting-table bracket-name {
           "bracket": bracket,
           "status": IN_PROGRESS
       })
    )
  )

  (defun check-bracket-validity (bracket:list)
    ;;find a way to check this properly
    ;;dont want it to be computationally expensive
    ;right now its done in the front-end
    true
  )

  (defun finish-bracket-eb (admin-key:string bracket-name:string final-bracket:list winner:string)
     ;;called by admin or master
     ;;does all the table clean-up
     (with-capability (BRACKET-ADMIN-EB admin-key bracket-name)
       (enforce (check-bracket-validity final-bracket) "bracket format not valid")
       (update empty-bracket-table bracket-name {
           "bracket": final-bracket,
           "status": COMPLETE,
           "winner": winner
       })
     ;(pay-winner winner-keyset)
    )
  )

  (defun finish-bracket-bb (admin-key:string bracket-name:string final-bracket:list winner:string)
     ;;called by admin or master
     ;;does all the table clean-up
     ;;need to figure out which player is the winner...
     (with-capability (BRACKET-ADMIN-BB admin-key bracket-name)
       (enforce (check-bracket-validity final-bracket) "bracket format not valid")
       (update bracket-betting-table bracket-name {
           "bracket": final-bracket,
           "status": COMPLETE,
           "winner": winner
       })
       ;function to figure out who the winners are...
     ;(pay-winner winner-keyset)
    )
  )

  ;;may have to be done on the front-end...
;   (defun find-winner-bb (admin-key:string bracket-name:string)
;     (update bracket-betting-table bracket-name {
;       "winner": "me" })
;   )


    (defun pay-winner-bb (admin-key:string bracket-name:string)
        (with-capability (BRACKET-ADMIN-BB admin-key bracket-name)
            (with-read bracket-betting-table bracket-name {
                "winner":= winner-key,
                "moneyPool":= money-pool,
                "status":= status
            }
            (enforce (= status COMPLETE) "game is not complete yet")
            (with-capability (BB-CONTRACT-CAN-TRANSFER bracket-name money-pool)
                (with-read users-table winner-key {
                  "balance":= current-balance-winner,
                  "games-won":= games-won
                }
                  (with-read users-table admin-key {
                  "balance":= current-balance-admin
                  }
                      (update users-table winner-key {
                        "balance": (+ current-balance-winner money-pool),
                        "games-won": (+ games-won [bracket-name])
                      })
                      (update bracket-betting-table bracket-name { "status": WINNER_PAID })
                  )
                )
            )
            (coin.transfer CONTRACT_ACCOUNT winner-key (read-keyset winner-key) (* money-pool 1.0))
            )
        )
    )

    (defun pay-winner-eb (admin-key:string bracket-name:string)
        (with-capability (BRACKET-ADMIN-EB admin-key bracket-name)
            (with-read empty-bracket-table bracket-name {
                "winner":= winner-key,
                "moneyPool":= money-pool,
                "status":= status
            }
            (enforce (= status COMPLETE) "game is not complete yet")
            (with-capability (EB-CONTRACT-CAN-TRANSFER bracket-name money-pool)
                (with-read users-table winner-key {
                  "balance":= current-balance-winner,
                  "games-won":= games-won
                }
                  (with-read users-table admin-key {
                  "balance":= current-balance-admin
                  }
                      (update users-table winner-key {
                        "balance": (+ current-balance-winner money-pool),
                        "games-won": (+ games-won [bracket-name])
                      })
                      (update empty-bracket-table bracket-name { "status": WINNER_PAID })
                  )
                )
            )
            (coin.transfer CONTRACT_ACCOUNT winner-key (read-keyset winner-key) (* money-pool 1.0))
            )
        )
    )

  ;(defun return-money (admin-key:string bracket-name:string)
    ;return money to all participants
    ;then end the game
;  )

;maybe a good place to compose-capabilities(?)
;or enforce-one
;  (defun delete-bracket (bracket-name:string)

     ;;called by either admin or master
     ;;return money to all participants
     ;;delete game from table
;  )

)





(create-table users-table)
(create-table bracket-betting-table)
(create-table empty-bracket-table)
;this call is essential and inits the contract in the coin table
(coin.create-account CONTRACT_ACCOUNT (contract-guard))
