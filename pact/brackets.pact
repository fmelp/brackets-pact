(module brackets BRACKETS-GOVERNANCE

  (defun enforce-brackets-admin ()
    (enforce-guard (read-keyset "master-bracket-keyset"))
  )

  (defcap BRACKETS-GOVERNANCE ()
    (enforce-brackets-admin)
  )

   ;game initiated, people still signing up
   (defconst INITIATED:string "initiated")
   ;people signed up, game in progress
   (defconst IN_PROGRESS:string "in-progress")
   ;game finished and winner paid
   (defconst COMPLETE:string "complete")
   ;team has no player assigned
   (defconst UNASSIGNED:string "unassigned")

  (defschema empty-bracket
    ;will need to refactor admin to take in a keyset
    ;not sure how to do this from the frontend though...
    admin:string
    bracket:list
    status:string
    moneyPool:decimal
    players:[string]
    winner:string
    entryFee:decimal)
    ;guard:guard

  (deftable empty-bracket-table:{empty-bracket})

  (defschema bracket-betting
    ;will need to refactor admin to take in a keyset
    ;not sure how to do this from the frontend though...
    admin:string
    bracket:list
    status:string
    moneyPool:decimal
    players:[string]
    players-bets:list
    winner:string
    entryFee:decimal)

  (deftable bracket-betting-table:{bracket-betting})

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

  (defun init-empty-bracket
    (admin-key:string bracket-name:string bracket:list number-players:integer entry-fee:decimal)
    "initiate a new bracket"
    (enforce (check-bracket-validity bracket) "bracket format not valid")
    ; anyone can init a new bracket.
     (insert empty-bracket-table bracket-name {
      ;"admin": (at "sender" (chain-data)),
       "admin": admin-key,
       "bracket": bracket,
       "status": INITIATED,
       "moneyPool": 0.0,
       "players": (make-list number-players UNASSIGNED),
       "winner": UNASSIGNED,
       "entryFee": entry-fee
     })
  )

  (defun init-bracket-betting
    (admin-key:string bracket-name:string bracket:list entry-fee:decimal)
    "initiate a new bracket"
    (enforce (check-bracket-validity bracket) "bracket format not valid")
    ; anyone can init a new bracket.
     (insert bracket-betting-table bracket-name {
      ;"admin": (at "sender" (chain-data)),
       "admin": admin-key,
       "bracket": bracket,
       "status": INITIATED,
       "moneyPool": 0.0,
       "players": [],
       "players-bets": [],
       "winner": UNASSIGNED,
       "entryFee": entry-fee
     })
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
      "admin":= admin}
      [players, bracket, status, entry-fee, admin]
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

  (defun enter-tournament-eb (bracket-name:string player-key:string player-index:integer)
    (with-read empty-bracket-table bracket-name {
      "players":= players}
      ;commented this line out for testing purposes
      (enforce (!= (contains player-key players) true) "you can only enter once")
      (enforce (= (at player-index players) UNASSIGNED) "this spot is not available")

      ;;make the payment here
      ;probably use a pact
      ;dont execute rest of code until tx is confirmed


      (update empty-bracket-table bracket-name {
        "players": (+ (+ (take player-index players) [player-key]) (take (- (- (- (length players) player-index) 1)) players))
      })
    )
  )


  (defun enter-tournament-bb (bracket-name:string player-key:string player-bet:list)
    ;there is not limit to how many people can join as long as they pay the entry fee
    (with-read bracket-betting-table bracket-name {
     "players":= players,
     "players-bets":= players-bets}

     (enforce (!= (contains player-key players) true) "you can only enter once")

    ;;get the payment done here
      (update bracket-betting-table bracket-name {
        "players": (+ players [player-key]),
        "players-bets": (+ players-bets [player-bet])}
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

  (defun finish-bracket-bb (admin-key:string bracket-name:string final-bracket:list)
     ;;called by admin or master
     ;;does all the table clean-up
     (with-capability (BRACKET-ADMIN-BB admin-key bracket-name)
       (enforce (check-bracket-validity final-bracket) "bracket format not valid")
       (update bracket-betting-table bracket-name {
           "bracket": final-bracket,
           "status": COMPLETE
       })
       ;function to figure out who the winners are...
     ;(pay-winner winner-keyset)
    )
  )

;  (defun pay-winner (winner-keyset:keyset)
     ;;send money to winner keyset
     ;;send small cut to master
;  )

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

(create-table bracket-betting-table)
; (init-bracket-betting "bb-admin" "test-bb" [] 12.3)
; (enter-tournament-bb "test-bb" "player-bb" [])
; (get-bb-info "test-bb")
; (advance-bracket-bb "bb-admin" "test-bb" [1 2 3])
; (get-bb-info "test-bb")

(create-table empty-bracket-table)
; (init-empty-bracket "eb-admin" "test-eb" [] 8 12.3)
; (enter-tournament-eb "test-eb" "player-eb" 3)
; (get-eb-info "test-eb")
; (advance-bracket-eb "eb-admin" "test-eb" [1 2 3])
; (get-eb-info "test-eb")
