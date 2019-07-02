(define-keyset 'master-bracket-keyset (read-keyset "master-bracket-keyset"))

(module brackets 'master-bracket-keyset

     ;game initiated, people still signing up
     (defconst INITIATED:string "initiated")
     ;people signed up, game in progress
     (defconst IN_PROGRESS:string "in-progress")
     ;game finished and winner paid
     (defconst COMPLETE:string "complete")
     ;team has no player assigned
     (defconst UNASSIGNED:string "unassigned")


  (defschema bracket
    admin:string
    bracket-type:string
    bracket:list
    status:string
    moneyPool:decimal
    teams:[string]
    players:[string]
    winner:string)
    ;guard:guard

  (deftable bracket-table:{bracket})


  (defun init-bracket
    (admin-key:string bracket-name:string bracket-type:string bracket:list team-list:list)
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
       "winner": UNASSIGNED
     })
  )

  (defun get-teams-players-seeds (bracket-name:string)
    ;;anyone can call this
    (with-read bracket-table bracket-name {
      "teams":= teams,
      "players":= players}
      [teams, players]
    )
  )

  (defun get-bracket-names ()
    ;;anyone can call this
    (keys bracket-table)
  )

  (defun enter-bracket (bracket-name:string player-key:string team-name:string team-index:integer)
    (with-read bracket-table bracket-name {
      "teams":= teams,
      "players":= players}
      ;make sure team exists at that index
      (enforce (= (at team-index teams) team-name) "team and index do not match")
      ;make sure the team is unassigned
      (enforce (= (at team-index players) UNASSIGNED) "team is already taken")

      ;;make payment here somewhere...
      ;probably a good place to use a pact

      (update bracket-table bracket-name {
        ;im assuming theres a less stupid way to do this
        "players": (+ (+ (take team-index players) [player-key]) (take (- (- (- (length players) team-index) 1)) players))
      })
    )
  )

  (defun advance-bracket (bracket-name:string bracket:list)
     ;;check the bracket list validity on the front
     ;maybe some minimal checking here too
     (enforce (check-bracket-validity bracket) "bracket format not valid")
     ;;can only be called by admin of that bracket
     (update bracket-table bracket-name {
         "bracket": bracket,
         "status": IN_PROGRESS
     })
  )

  (defun check-bracket-validity (bracket:list)
    ;;find a way to check this properly
    true
  )

  (defun finish-bracket (bracket-name:string winner:string final-bracket:list)
     ;;called by admin or master
     ;;does all the table clean-up
     (enforce (check-bracket-validity bracket) "bracket format not valid")
     (update bracket-table bracket-name {
         "bracket": bracket,
         "status": COMPLETE,
         "winner": winner
     })
     ;(pay-winner winner-keyset)
  )

;  (defun pay-winner (winner-keyset:keyset)
     ;;send money to winner keyset
     ;;send small cut to master
;  )

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
