(define-keyset 'master-bracket-keyset
  (read-keyset "master-bracket-keyset"))

(module brackets 'master-bracket-keyset

 ;game initiated, people still signing up
 (defconst INITIATED:string "initiated")
 ;people signed up, game in progress
 (defconst IN_PROGRESS:string "in-progress")
 ;game finished and winner paid
 (defconst COMPLETE:string "complete")

 (defschema bracket
   admin:keyset
   bracket-type:string
   bracket:list
   status:string
   team-participant-pair:object
   money-pool:decimal
   winner:keyset
   guard:guard
 )

 (deftable brackets:{bracket})

;;another table for contract accounting?
;  (defschema bracket-accounting

 ;verifying the structure of the game will be done on the front-end
 ;for elimination, must be a power of two
 ;will format and return the array in React
 ;note that bracket-name MUST be unique
 ;; do some error handling if someone tries to start bracket w same name
 (defun init-bracket (bracket-name:string admin:keyset
   bracket-type:string bracket:list initial-teams:object)
    ;anyone should be able to create a new game
    ;make sure the bracket fullfills the requirements.
    ;   number teams must be a power of two
    (insert brackets bracket-name {
      "admin": admin,
      "bracket-type": bracket-type,
      "bracket": bracket,
      "status": INITIATED,
      "team-participant-pair": initial-teams,
      "money-pool": 0.0
    })
 )

 (defun enter-bracket (bracket-name:string team-name:string player-keyset:keyset)
    ;;anyone can call this given there's free teams
    ;;do the object checking in the front-end??
    ;;needs to send the money, and we need to verfiy it has been recieved
    ;;maybe a good place to use a pact
    ; (update brackets bracket-name {

    ; })
 )

 (defun advance-bracket (bracket-name:string bracket:list)
    ;;check the bracket list validity on the front
    ;;can only be called by admin of that bracket
    (update brackets bracket-name {
        "bracket": bracket,
        "status": IN_PROGRESS
    })
 )

 (defun finish-bracket (bracket-name:string winner-keyset:keyset final-bracket:list)
    ;;called by admin or master
    ;;does all the table clean-up
    (advance-bracket bracket-name final-bracket)
    (pay-winner winner-keyset)
 )

 (defun pay-winner (winner-keyset:keyset)
    ;;send money to winner keyset
    ;;send small cut to master
 )

 (defun delete-bracket (bracket-name:string)
    ;;called by either admin or master
    ;;return money to all participants
    ;;delete game from table
 )


)

(create-table brackets)
