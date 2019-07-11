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


  (defschema bracket
    ;will need to refactor admin to take in a keyset
    ;not sure how to do this from the frontend though...
    admin:string
    bracket-type:string
    bracket:list
    status:string
    moneyPool:decimal
    teams:[string]
    players:[string]
    winner:string
    entryFee:decimal)
    ;guard:guard

  (deftable bracket-table:{bracket})

  (defcap BRACKET-ADMIN (admin-key:string bracket-name:string)
    (with-read bracket-table bracket-name { "admin":= admin-key-db }
      (enforce (= admin-key admin-key-db) "you are not the bracket admin")
    )
  )

  (defun init-bracket
    (admin-key:string bracket-name:string bracket-type:string bracket:list team-list:list entry-fee:decimal)
    "initiate a new bracket"
    (enforce (check-bracket-validity bracket) "bracket format not valid")
    ; anyone can init a new bracket.
     (insert bracket-table bracket-name {
      ;"admin": (at "sender" (chain-data)),
       "admin": admin-key,
       "bracket-type": bracket-type,
       "bracket": bracket,
       "status": INITIATED,
       "moneyPool": 0.0,
       "teams": team-list,
       "players": (make-list (length team-list) UNASSIGNED),
       "winner": UNASSIGNED,
       "entryFee": entry-fee
     })
  )

  (defun get-teams-players-seeds (bracket-name:string)
    ;;anyone can call this
    (with-read bracket-table bracket-name {
      "teams":= teams,
      "players":= players,
      "bracket":= bracket,
      "status":= status,
      "entryFee":= entry-fee,
      "admin":= admin}
      [teams, players, bracket, status, entry-fee, admin]
    )
  )

  (defun get-bracket-names ()
    ;;anyone can call this
    (keys bracket-table)
  )



  (defun enter-bracket-w-team (bracket-name:string player-key:string team-name:string team-index:integer)
    ;;anyone can enter a bracket
    (with-read bracket-table bracket-name {
      "teams":= teams,
      "players":= players}
      (enforce (= (at team-index teams) team-name) "team and index do not match")
      (enforce (= (at team-index players) UNASSIGNED) "team is already taken")
      ;here we need to make the payment into the tournament from the player
      ; probably using a pact
      ; rest of code wont execute until tx is confirmed

      (update bracket-table bracket-name {
        ;im assuming theres a less stupid way to do this
        "players": (+ (+ (take team-index players) [player-key]) (take (- (- (- (length players) team-index) 1)) players))
      })
    )
  )

  (defun advance-bracket (admin-key:string bracket-name:string bracket:list)
     ;;check the bracket list validity on the front
     ;maybe some minimal checking here too
     (with-capability (BRACKET-ADMIN admin-key bracket-name)
       (enforce (check-bracket-validity bracket) "bracket format not valid")
       ;;can only be called by admin of that bracket
       (update bracket-table bracket-name {
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

  (defun finish-bracket (admin-key:string bracket-name:string final-bracket:list winner:string)
     ;;called by admin or master
     ;;does all the table clean-up
     (with-capability (BRACKET-ADMIN admin-key bracket-name)
       (enforce (check-bracket-validity final-bracket) "bracket format not valid")
       (update bracket-table bracket-name {
           "bracket": final-bracket,
           "status": COMPLETE,
           "winner": winner
       })
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

  (create-table bracket-table)

; (create-table bracket-table)
; (env-chain-data {"block-time": 1557336000})
;(env-chain-data {"sender": "somec"})
; (init-bracket "ssddddt" "single-elimination" [] {"fff":""})
;(init-bracket "sswt" "single-elimination" [] {"fff":""})
;(test "sswt")
