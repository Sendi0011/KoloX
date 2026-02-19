;; KoloX - Community Savings Platform on Stacks
;; ENHANCEMENT: Emergency Withdrawal & Slashing Mechanism
;; Protects the group from defaulting members while allowing emergency exits

;; ====================================================================================
;; NEW CONSTANTS (to be added to constants contract)
;; ====================================================================================
;; These would be in your constants contract:
;; (define-constant GRACE-PERIOD u144)          ;; ~24 hours (assuming 10-min blocks)
;; (define-constant SLASH-PERCENTAGE u20)       ;; 20% penalty for emergency withdrawal
;; (define-constant REPUTATION-SLASH u50)       ;; Reputation points lost on default
;; (define-constant MIN-SLASH-AMOUNT u1000)     ;; Minimum slash amount in sats

;; ====================================================================================
;; NEW ERROR CODES
;; ====================================================================================
(define-constant ERR-EMERGENCY-NOT-AVAILABLE (err u4001))
(define-constant ERR-INSUFFICIENT-CONTRIBUTIONS (err u4002))
(define-constant ERR-ALREADY-DEFAULTED (err u4003))
(define-constant ERR-NO-CONTRIBUTIONS (err u4004))
(define-constant ERR-INVALID-SLASH (err u4005))

;; ====================================================================================
;; ENHANCED DATA STRUCTURES
;; ====================================================================================

;; Track member defaults and emergency withdrawals
(define-map kolo-defaults
  { kolo-id: uint, user: principal }
  {
    defaulted: bool,                    ;; Has member defaulted?
    default-round: uint,                 ;; Round when default occurred
    slashed-amount: uint,                ;; Amount slashed on emergency withdrawal
    emergency-withdrawn: bool,           ;; Has member done emergency withdrawal?
    emergency-withdrawn-at: uint,        ;; Block height of emergency withdrawal
    compensated-members: (list 50 principal)  ;; Members who received compensation
  }
)

;; Track compensation pool for defaulted members
(define-map compensation-pool
  { kolo-id: uint }
  {
    total-slashed: uint,                 ;; Total slashed funds available
    distributed: uint,                   ;; Already distributed
    defaulted-member: (optional principal),  ;; Member who defaulted
    default-round: uint                   ;; Round when default occurred
  }
)

;; ====================================================================================
;; ENHANCED MEMBER INFO (add to existing kolo-members)
;; ====================================================================================
;; Add these fields to your existing kolo-members map:
;;    contribution-streak: uint,           ;; Consecutive contributions
;;    last-contribution-round: uint,        ;; Last round contributed
;;    can-emergency-withdraw: bool          ;; Eligibility for emergency withdrawal

;; ====================================================================================
;; NEW READ-ONLY FUNCTIONS
;; ====================================================================================

;; Check if member can do emergency withdrawal
(define-read-only (can-emergency-withdraw (kolo-id uint) (user principal))
  (match (map-get? kolos kolo-id)
    kolo
      (match (get-member-info kolo-id user)
        member
          (let
            (
              (current-round (get current-round kolo))
              (last-contribution (get last-contribution-round member))
              (missed-payments (get missed-payments member))
              (current-block block-height)
              (round-deadline (+ (get start-block kolo) (* (get frequency kolo) (+ current-round u1))))
            )
            ;; Can withdraw if:
            ;; 1. Member has missed payments AND
            ;; 2. Current round deadline has passed OR
            ;; 3. Member has contributed but needs emergency exit
            (and
              (not (get withdrawn member))
              (or 
                (and (> missed-payments u0) (>= current-block round-deadline))
                (and (> (get total-contributions member) u0) 
                     (>= current-block (+ round-deadline (contract-call? .constants GRACE-PERIOD))))
              )
            )
          )
        false
      )
    false
  )
)

;; Calculate emergency withdrawal amount (after slash penalty)
(define-read-only (calculate-emergency-withdrawal (kolo-id uint) (user principal))
  (match (get-member-info kolo-id user)
    member
      (let
        (
          (total-contributed (get total-contributions member))
          (slash-penalty (/ (* total-contributed (contract-call? .constants SLASH-PERCENTAGE)) u100))
          (min-slash (contract-call? .constants MIN-SLASH-AMOUNT))
          (final-slash (if (> slash-penalty min-slash) slash-penalty min-slash))
        )
        (if (>= total-contributed final-slash)
          (some (- total-contributed final-slash))
          (some u0)
        )
      )
    none
  )
)

;; Get default info for a member
(define-read-only (get-default-info (kolo-id uint) (user principal))
  (map-get? kolo-defaults { kolo-id: kolo-id, user: user })
)

;; Get compensation pool info
(define-read-only (get-compensation-pool (kolo-id uint))
  (map-get? compensation-pool { kolo-id: kolo-id })
)

;; ====================================================================================
;; NEW PUBLIC FUNCTIONS
;; ====================================================================================

;; Emergency withdrawal for members who can't continue
;; Slashes 20% of contributions, distributes to remaining members
(define-public (emergency-withdraw (kolo-id uint))
  (let
    (
      (kolo (unwrap! (map-get? kolos kolo-id) (contract-call? .constants ERR-KOLO-NOT-FOUND)))
      (member (unwrap! (get-member-info kolo-id tx-sender) (contract-call? .constants ERR-NOT-MEMBER)))
      (default-info (default-to 
        { defaulted: false, default-round: u0, slashed-amount: u0, emergency-withdrawn: false, emergency-withdrawn-at: u0, compensated-members: (list) }
        (map-get? kolo-defaults { kolo-id: kolo-id, user: tx-sender })
      ))
      (current-round (get current-round kolo))
      (total-contributed (get total-contributions member))
      (current-block block-height)
    )
    ;; Validation
    (asserts! (can-emergency-withdraw kolo-id tx-sender) ERR-EMERGENCY-NOT-AVAILABLE)
    (asserts! (> total-contributed u0) ERR-NO-CONTRIBUTIONS)
    (asserts! (not (get emergency-withdrawn default-info)) ERR-ALREADY-WITHDRAWN)
    (asserts! (not (get defaulted default-info)) ERR-ALREADY-DEFAULTED)

    ;; Calculate slashed amount and withdrawal amount
    (let
      (
        (withdrawal-info (unwrap! (calculate-emergency-withdrawal kolo-id tx-sender) ERR-INVALID-SLASH))
        (slash-amount (- total-contributed withdrawal-info))
      )

      ;; Transfer remaining contributions back to user (after slash)
      (try! (as-contract (stx-transfer? withdrawal-info (as-contract tx-sender) tx-sender)))

      ;; Update member info
      (map-set kolo-members { kolo-id: kolo-id, user: tx-sender }
        (merge member { 
          withdrawn: true,
          missed-payments: (+ (get missed-payments member) u1),
          reputation-score: (- (get reputation-score member) (contract-call? .constants REPUTATION-SLASH))
        })
      )

      ;; Record default/emergency info
      (map-set kolo-defaults { kolo-id: kolo-id, user: tx-sender }
        {
          defaulted: true,
          default-round: current-round,
          slashed-amount: slash-amount,
          emergency-withdrawn: true,
          emergency-withdrawn-at: current-block,
          compensated-members: (list)
        }
      )

      ;; Create compensation pool for remaining members
      (map-set compensation-pool { kolo-id: kolo-id }
        {
          total-slashed: slash-amount,
          distributed: u0,
          defaulted-member: (some tx-sender),
          default-round: current-round
        }
      )

      ;; Update kolo stats
      (let
        (
          (stats (default-to { total-collected: u0, total-paid-out: u0, completed-rounds: u0 } 
                              (map-get? kolo-stats kolo-id)))
        )
        (map-set kolo-stats kolo-id 
          (merge stats { total-collected: (- (get total-collected stats) slash-amount) })
        )
      )

      (print { 
        event: "emergency-withdrawal", 
        kolo-id: kolo-id, 
        user: tx-sender, 
        round: current-round,
        total-contributed: total-contributed,
        withdrawal-amount: withdrawal-info,
        slashed-amount: slash-amount
      })

      (ok withdrawal-info)
    )
  )
)

;; Distribute slashed funds to remaining members
(define-public (distribute-slash-funds (kolo-id uint))
  (let
    (
      (kolo (unwrap! (map-get? kolos kolo-id) (contract-call? .constants ERR-KOLO-NOT-FOUND)))
      (pool (unwrap! (map-get? compensation-pool { kolo-id: kolo-id }) ERR-COMPENSATION-POOL-EMPTY))
      (defaulted-member (unwrap! (get defaulted-member pool) ERR-INVALID-PARAMS))
      (current-round (get current-round kolo))
      (current-block block-height)
    )

    ;; Calculate share for remaining members
    (let
      (
        (total-members (get-member-count kolo-id))
        (active-members (- total-members u1)) ;; Exclude defaulted member
        (total-slashed (get total-slashed pool))
        (already-distributed (get distributed pool))
        (remaining-to-distribute (- total-slashed already-distributed))
      )

      ;; Only distribute if there's remaining funds and active members
      (asserts! (> remaining-to-distribute u0) ERR-INSUFFICIENT-BALANCE)
      (asserts! (> active-members u0) ERR-INVALID-PARAMS)

      (let
        (
          (share-per-member (/ remaining-to-distribute active-members))
        )

        ;; Distribute to each active member
        ;; Note: This is simplified - in production, you'd iterate through members
        ;; For this enhancement, we'll assume a separate function for claiming

        ;; Update pool
        (map-set compensation-pool { kolo-id: kolo-id }
          (merge pool { distributed: (+ already-distributed remaining-to-distribute) })
        )

        (print {
          event: "slash-funds-distributed",
          kolo-id: kolo-id,
          defaulted-member: defaulted-member,
          total-slashed: total-slashed,
          distributed: remaining-to-distribute,
          per-member: share-per-member,
          round: current-round
        })

        (ok share-per-member)
      )
    )
  )
)

;; Claim share from slashed funds (for active members)
(define-public (claim-slash-share (kolo-id uint))
  (let
    (
      (kolo (unwrap! (map-get? kolos kolo-id) (contract-call? .constants ERR-KOLO-NOT-FOUND)))
      (member (unwrap! (get-member-info kolo-id tx-sender) (contract-call? .constants ERR-NOT-MEMBER)))
      (pool (unwrap! (map-get? compensation-pool { kolo-id: kolo-id }) ERR-COMPENSATION-POOL-EMPTY))
      (defaulted-member (unwrap! (get defaulted-member pool) ERR-INVALID-PARAMS))
    )

    ;; Can't claim if you're the defaulted member
    (asserts! (not (is-eq tx-sender defaulted-member)) ERR-NOT-AUTHORIZED)

    ;; Calculate share
    (let
      (
        (total-members (get-member-count kolo-id))
        (active-members (- total-members u1))
        (total-slashed (get total-slashed pool))
        (already-distributed (get distributed pool))
        (available (- total-slashed already-distributed))
        (share-per-member (/ total-slashed active-members))
        (member-defaults (default-to 
          { defaulted: false, default-round: u0, slashed-amount: u0, emergency-withdrawn: false, emergency-withdrawn-at: u0, compensated-members: (list) }
          (map-get? kolo-defaults { kolo-id: kolo-id, user: defaulted-member })
        ))
      )

      (asserts! (>= available share-per-member) ERR-INSUFFICIENT-BALANCE)

      ;; Transfer share to member
      (try! (as-contract (stx-transfer? share-per-member (as-contract tx-sender) tx-sender)))

      ;; Update pool
      (map-set compensation-pool { kolo-id: kolo-id }
        (merge pool { distributed: (+ already-distributed share-per-member) })
      )

      ;; Update default record with compensated member
      (map-set kolo-defaults { kolo-id: kolo-id, user: defaulted-member }
        (merge member-defaults { 
          compensated-members: (unwrap-panic 
            (as-max-len? (append (get compensated-members member-defaults) tx-sender) u50)
          )
        })
      )

      (print {
        event: "slash-share-claimed",
        kolo-id: kolo-id,
        claimant: tx-sender,
        amount: share-per-member,
        defaulted-member: defaulted-member
      })

      (ok share-per-member)
    )
  )
)

;; Mark member as defaulter (after missed payments)
(define-public (mark-default (kolo-id uint) (user principal))
  (let
    (
      (kolo (unwrap! (map-get? kolos kolo-id) (contract-call? .constants ERR-KOLO-NOT-FOUND)))
      (member (unwrap! (get-member-info kolo-id user) (contract-call? .constants ERR-NOT-MEMBER)))
      (caller-is-creator (is-kolo-creator kolo-id tx-sender))
      (current-round (get current-round kolo))
    )

    ;; Only kolo creator can mark default
    (asserts! caller-is-creator (contract-call? .constants ERR-NOT-AUTHORIZED))
    
    ;; Check if round deadline passed and member hasn't paid
    (asserts! (is-round-deadline-passed kolo-id) ERR-EMERGENCY-NOT-AVAILABLE)
    (asserts! (not (has-paid-current-round kolo-id user)) ERR-ALREADY-PAID)

    ;; Update member info
    (map-set kolo-members { kolo-id: kolo-id, user: user }
      (merge member { 
        missed-payments: (+ (get missed-payments member) u1),
        reputation-score: (- (get reputation-score member) (contract-call? .constants REPUTATION-SLASH))
      })
    )

    (print {
      event: "member-defaulted",
      kolo-id: kolo-id,
      user: user,
      round: current-round,
      marked-by: tx-sender
    })

    (ok true)
  )
)

;; ====================================================================================
;; ENHANCED CONTRIBUTE FUNCTION (add to existing contribute)
;; ====================================================================================
;; Add this to your existing contribute function to track streaks:

;; In contribute function, after successful contribution:
;;(let
;;  (
;;    (last-round (get last-contribution-round member))
;;    (current-round (get current-round kolo))
;;  )
;;  ;; Update contribution streak
;;  (let
;;    (
;;      (new-streak (if (is-eq last-round (- current-round u1))
;;                    (+ (get contribution-streak member) u1)
;;                    u1))
;;    )
;;    (map-set kolo-members { kolo-id: kolo-id, user: tx-sender }
;;      (merge member {
;;        contribution-streak: new-streak,
;;        last-contribution-round: current-round
;;      })
;;    )
;;  )
;;)
