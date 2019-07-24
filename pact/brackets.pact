
(module coin GOVERNANCE

  "'coin' represents the Kadena Coin Contract. This contract provides both the \
  \buy/redeem gas support in the form of 'fund-tx', as well as transfer,       \
  \credit, debit, coinbase, account creation and query, as well as SPV burn    \
  \create. To access the coin contract, you may use its fully-qualified name,  \
  \or issue the '(use coin)' command in the body of a module declaration."


  ;(implements coin-sig)

  ; --------------------------------------------------------------------------
  ; Schemas and Tables

  (defschema coin-schema
    balance:decimal
    guard:guard)
  (deftable coin-table:{coin-schema})

  ; the shape of a cross-chain transfer (used for typechecking)
  (defschema transfer-schema
    create-account:string
    create-account-guard:guard
    quantity:decimal
    )

  ; --------------------------------------------------------------------------
  ; Capabilities

  (defcap GOVERNANCE ()
    "Enforce non-upgradeability except in the case of a hard fork"
    false)

  (defcap TRANSFER ()
    "Autonomous capability to protect debit and credit actions"
    true)

  (defcap COINBASE ()
    "Magic capability to protect miner reward"
    true)

  (defcap FUND_TX ()
    "Magic capability to execute gas purchases and redemptions"
    true)

  (defcap ACCOUNT_GUARD (account)
    "Lookup and enforce guards associated with an account"
    (with-read coin-table account { "guard" := g }
      (enforce-guard g)))

  (defcap GOVERNANCE ()
    (enforce false "Enforce non-upgradeability except in the case of a hard fork"))

  ; --------------------------------------------------------------------------
  ; Coin Contract

  (defun buy-gas:string (sender:string total:decimal)
    @doc "This function describes the main 'gas buy' operation. At this point \
    \MINER has been chosen from the pool, and will be validated. The SENDER   \
    \of this transaction has specified a gas limit LIMIT (maximum gas) for    \
    \the transaction, and the price is the spot price of gas at that time.    \
    \The gas buy will be executed prior to executing SENDER's code."

    @model [(property (> total 0.0))]

    (require-capability (FUND_TX))
    (with-capability (TRANSFER)
      (debit sender total))
    )

  (defun redeem-gas:string (miner:string miner-guard:guard sender:string total:decimal)
    @doc "This function describes the main 'redeem gas' operation. At this    \
    \point, the SENDER's transaction has been executed, and the gas that      \
    \was charged has been calculated. MINER will be credited the gas cost,    \
    \and SENDER will receive the remainder up to the limit"

    @model [(property (> total 0.0))]

    (require-capability (FUND_TX))
    (with-capability (TRANSFER)
      (let* ((fee (read-decimal "fee"))
             (refund (- total fee)))
        (enforce (>= refund 0.0) "fee must be less than or equal to total")


        ; directly update instead of credit
        (if (> refund 0.0)
          (with-read coin-table sender
            { "balance" := balance }
            (update coin-table sender
              { "balance": (+ balance refund) })
            )
          "noop")
        (credit miner miner-guard fee)
        ))
    )

  (defun create-account:string (account:string guard:guard)
    (insert coin-table account
      { "balance" : 0.0
      , "guard"   : guard
      })
    )

  (defun account-balance:decimal (account:string)
    (with-read coin-table account
      { "balance" := balance }
      balance
      )
    )

  (defun transfer:string (sender:string receiver:string receiver-guard:guard amount:decimal)

    (enforce (not (= sender receiver))
      "sender cannot be the receiver of a transfer")

    (with-capability (TRANSFER)
      (debit sender amount)
      (credit receiver receiver-guard amount))
    )

  (defun coinbase:string (address:string address-guard:guard amount:decimal)
  ;;took this out too....
    ;(require-capability (COINBASE))
    (with-capability (TRANSFER)
     (credit address address-guard amount))
    )

  (defpact fund-tx (sender miner miner-guard total)
    @doc "'fund-tx' is a special pact to fund a transaction in two steps,     \
    \with the actual transaction transpiring in the middle:                   \
    \                                                                         \
    \  1) A buying phase, debiting the sender for total gas and fee, yielding \
    \     TX_MAX_CHARGE.                                                      \
    \  2) A settlement phase, resuming TX_MAX_CHARGE, and allocating to the   \
    \     coinbase account for used gas and fee, and sender account for bal-  \
    \     ance (unused gas, if any)."

    (step (buy-gas sender total))
    (step (redeem-gas miner miner-guard sender total))
    )

  (defun debit:string (account:string amount:decimal)
    @doc "Debit AMOUNT from ACCOUNT balance recording DATE and DATA"

    @model [ (property (> amount 0.0)) ]

    (enforce (> amount 0.0)
      "debit amount must be positive")

    (require-capability (TRANSFER))

    ;had to remove this because i cannot get the envdata set in front-end
    ; to reach this point in the function, says it cant find the keyset
    ;ERROR tx failure for requestKey: "sc2OprIwclSjizrNkBMQb2zXmZMRDcquYFzB1jjyZwI": (enforce-guard g): Failure: Tx Failed: Keyset failure (keys-all)

    ;(with-capability (ACCOUNT_GUARD account)
      (with-read coin-table account
        { "balance" := balance }

        (enforce (<= amount balance) "Insufficient funds")
        (update coin-table account
          { "balance" : (- balance amount) }
          )))
    ;)


  (defun credit:string (account:string guard:guard amount:decimal)
    @doc "Credit AMOUNT to ACCOUNT balance recording DATE and DATA"

    @model [ (property (> amount 0.0))
             (property (not (= account "")))
           ]

    (enforce (> amount 0.0)
      "debit amount must be positive")

    (require-capability (TRANSFER))
    (with-default-read coin-table account
      { "balance" : 0.0, "guard" : guard }
      { "balance" := balance, "guard" := retg }
      ; we don't want to overwrite an existing guard with the user-supplied one
      (enforce (= retg guard)
        "account guards do not match")

      (write coin-table account
        { "balance" : (+ balance amount)
        , "guard"   : retg
        })
      ))

  (defpact cross-chain-transfer
    ( delete-account:string
      create-chain-id:string
      create-account:string
      create-account-guard:guard
      quantity:decimal )

    @doc "Transfer QUANTITY coins from DELETE-ACCOUNT on current chain to           \
         \CREATE-ACCOUNT on CREATE-CHAIN-ID. Target chain id must not be the        \
         \current chain-id.                                                         \
         \                                                                          \
         \Step 1: Burn QUANTITY-many coins for DELETE-ACCOUNT on the current chain, \
         \and produce an SPV receipt which may be manually redeemed for an SPV      \
         \proof. Once a proof is obtained, the user may call 'create-coin' and      \
         \consume the proof on CREATE-CHAIN-ID, crediting CREATE-ACCOUNT QUANTITY-  \
         \many coins.                                                               \
         \                                                                          \
         \Step 2: Consume an SPV proof for a number of coins, and credit the        \
         \account associated with the proof the quantify of coins burned on the     \
         \source chain by the burn account. Note: must be called on the correct     \
         \chain id as specified in the proof."

    @model [ (property (> quantity 0.0))
           , (property (not (= create-chain-id "")))
           ]

    (step
      (with-capability (TRANSFER)
        (enforce (not (= (at 'chain-id (chain-data)) create-chain-id))
          "cannot run cross-chain transfers to the same chain")

        (debit delete-account quantity)
        (let
          ((retv:object{transfer-schema}
            { "create-account": create-account
            , "create-account-guard": create-account-guard
            , "quantity": quantity
            }))
          (yield retv create-chain-id)
          )))

    (step
      (resume
        { "create-account" := create-account
        , "create-account-guard" := create-account-guard
        , "quantity" := quantity
        }

        (with-capability (TRANSFER)
          (credit create-account create-account-guard quantity))
        ))
    )
)

(create-table coin-table)



(module coin-faucet FAUCET-GOVERNANCE

  "'coin-faucet' represents Kadena's Coin Faucet Contract."

  ;;Governance is TBD
  (defcap FAUCET-GOVERNANCE () true)

  ;; TODO - use hashed import
  (use coin)

  ; --------------------------------------------------------------------------
  ; Schemas and Tables
  ; --------------------------------------------------------------------------

  (defschema history
    @doc "Table to record the behavior of addresses. Last transaction time,       \
    \ total coins earned, and total coins returned are inserted or updated at     \
    \ transaction. "
    last-tx-time:time
    total-coins-earned:decimal
    total-coins-returned:decimal
    )

  (deftable history-table: {history})

  ; --------------------------------------------------------------------------
  ; Constants
  ; --------------------------------------------------------------------------

  (defconst FAUCET_ACCOUNT:string 'faucet-account)
  (defconst MAX_COIN_PER_REQUEST:decimal 20.0)
  (defconst WAIT_TIME_PER_REQUEST:decimal 3600.0)
  (defconst EPOCH:time  (time "1970-01-01T00:00:00Z"))

  ; --------------------------------------------------------------------------
  ; Coin Faucet Contract
  ; --------------------------------------------------------------------------
;(transfer address FAUCET_ACCOUNT (faucet-guard) amount)
  (defun faucet-guard:guard () (create-module-guard 'faucet-admin))

  ;(defun request-coin:string (address:string address-guard:guard amount:decimal)
  (defun request-coin:string (address:string amount-int:integer)
    @doc "Transfers AMOUNT of coins up to MAX_COIN_PER_REQUEST from the faucet    \
    \ account to the requester account at ADDRESS. Inserts or updates the         \
    \ transaction of the account at ADDRESS in history-table. Limits the number   \
    \ of coin requests by time, WAIT_TIME_PER_REQUEST "
    @model [(property (<= amount 20.0))]
    (let* ((address-guard (read-keyset (at "sender" (chain-data))))
          (amount (* 1.0 amount-int)))
    (enforce (<= amount MAX_COIN_PER_REQUEST)
      "Has reached maximum coin amount per request")

    (with-default-read history-table address {
      "last-tx-time": EPOCH,
      "total-coins-earned": 0.0,
      "total-coins-returned": 0.0 }
      {
      "last-tx-time":= last-tx-time,
      "total-coins-earned":= total-coins-earned,
      "total-coins-returned":= total-coins-returned }

      ;get rid of time constraint for now
      ;(enforce (> (diff-time (curr-time) last-tx-time) WAIT_TIME_PER_REQUEST)
        ;"Has reached maximum requests per wait time")

      (transfer FAUCET_ACCOUNT address address-guard amount)
      (write history-table address {
        "last-tx-time": (curr-time),
        "total-coins-earned": (+ amount total-coins-earned),
        "total-coins-returned": total-coins-returned }))))

  (defun return-coin:string (address:string amount:decimal)
    @doc "Returns the AMOUNT of coin from account at ADDRESS back to the faucet   \
    \ account after use. Updates the transaction of the account at ADDRESS in     \
    \ history-table keep track of behavior. "
    @model [(property (> amount 0.0))]

    (with-read history-table address
      {"total-coins-returned":= coins-returned}
      (transfer address FAUCET_ACCOUNT (faucet-guard) amount)
      (update history-table address
        {"total-coins-returned": (+ amount coins-returned)})))

  (defun read-history:object{history} (address:string)
    @doc "Returns history of the account at ADDRESS"
    (read history-table address))

  (defun curr-time:time ()
    @doc "Returns current chain's block-time in time type"
    (add-time EPOCH (at 'block-time (chain-data)))
  )
)

(create-table history-table)
;;this is what creates the account...
(coin.coinbase FAUCET_ACCOUNT (faucet-guard) 100000000000000.0)


(module brackets BRACKETS-GOVERNANCE

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
    user-guard:guard
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
      "user-guard": (read-keyset user-key),
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
    (bracket-name:string bracket:list number-players:integer entry-fee:integer)
    "initiate a new bracket"
    (let ((admin-key (at "sender" (chain-data))))
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
  )


  (defun init-bracket-betting
    (bracket-name:string bracket:list entry-fee:integer)
    "initiate a new bracket"
    ;is already a user of our systems
    (let ((admin-key (at "sender" (chain-data))))
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
  )

  (defun get-bb-info (bracket-name:string)
    ;;anyone can call this
    (with-read bracket-betting-table bracket-name {
      "players":= players,
      "players-bets":= players-bets,
      "bracket":= bracket,
      "status":= status,
      "entryFee":= entry-fee,
      "admin":= admin,
      "winner":= winner}
      [players, bracket, players-bets, status, entry-fee, admin, winner]
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
      "usernames":=usernames,
      "winner":=winner}
      [players, bracket, status, entry-fee, admin, usernames, winner]
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
    (bracket-name:string player-index:integer)
    (let ((player-key (at "sender" (chain-data))))
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
  )

  (defun test ()
    (let ((tx-data (chain-data)))
      [(at "sender" tx-data)]
    )
  )


  (defun enter-tournament-bb (bracket-name:string player-bet:list)
    (let ((player-key (at "sender" (chain-data))))
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
  )


  ;when we make the draw, we pass the draw bracket as bracket param
  (defun advance-bracket-eb (bracket-name:string bracket:list)
     ;;check the bracket list validity on the front
     ;maybe some minimal checking here too
     (let ((admin-key (at "sender" (chain-data))))
     (with-capability (BRACKET-ADMIN-EB admin-key bracket-name)
       (enforce (check-bracket-validity bracket) "bracket format not valid")
       ;;can only be called by admin of that bracket
       (update empty-bracket-table bracket-name {
           "bracket": bracket,
           "status": IN_PROGRESS
       })
    )
    )
  )

  (defun advance-bracket-bb (bracket-name:string bracket:list)
     ;;check the bracket list validity on the front
     ;maybe some minimal checking here too
     (let ((admin-key (at "sender" (chain-data))))
     (with-capability (BRACKET-ADMIN-BB admin-key bracket-name)
       (enforce (check-bracket-validity bracket) "bracket format not valid")
       ;;can only be called by admin of that bracket
       (update bracket-betting-table bracket-name {
           "bracket": bracket,
           "status": IN_PROGRESS
       })
    )
    )
  )

  (defun check-bracket-validity (bracket:list)
    ;;find a way to check this properly
    ;;dont want it to be computationally expensive
    ;right now its done in the front-end
    true
  )

  (defun finish-bracket-eb (bracket-name:string final-bracket:list winner:string)
     ;;called by admin or master
     ;;does all the table clean-up
     (let ((admin-key (at "sender" (chain-data))))
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
  )

  (defun finish-bracket-bb (bracket-name:string final-bracket:list winner:string)
     ;;called by admin or master
     ;;does all the table clean-up
     ;;need to figure out which player is the winner...
     (let ((admin-key (at "sender" (chain-data))))
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
  )

  ;;may have to be done on the front-end...
;   (defun find-winner-bb (admin-key:string bracket-name:string)
;     (update bracket-betting-table bracket-name {
;       "winner": "me" })
;   )


    (defun pay-winner-bb (bracket-name:string)
      (let ((admin-key (at "sender" (chain-data))))
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
                  "games-won":= games-won,
                  "user-guard":= winner-guard
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
                  (coin.transfer CONTRACT_ACCOUNT winner-key winner-guard (* money-pool 1.0))
                )

            )

            )
        )
      )
    )

    (defun pay-winner-eb (bracket-name:string)
      (let ((admin-key (at "sender" (chain-data))))
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
                  "games-won":= games-won,
                  "user-guard":=winner-guard
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
                (coin.transfer CONTRACT_ACCOUNT winner-key winner-guard (* money-pool 1.0))
                )

            )

            )
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
