import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;
const wallet3 = accounts.get("wallet_3")!;
const wallet4 = accounts.get("wallet_4")!;
const wallet5 = accounts.get("wallet_5")!;

// Helper functions
function createKolo(
  name: string = "Test Kolo",
  amount: number = 1000000, // 0.01 STX
  frequency: number = 1008, // WEEKLY (assuming 144 blocks/day * 7)
  maxMembers: number = 5,
  startBlock: number = 5000,
  sender: string = wallet1
) {
  return simnet.callPublicFn(
    "kolo",
    "create-kolo",
    [
      Cl.stringAscii(name),
      Cl.uint(amount),
      Cl.uint(frequency),
      Cl.uint(maxMembers),
      Cl.uint(startBlock)
    ],
    sender
  );
}

function joinKolo(koloId: number = 1, sender: string) {
  return simnet.callPublicFn(
    "kolo",
    "join-kolo",
    [Cl.uint(koloId)],
    sender
  );
}

function contribute(koloId: number = 1, sender: string) {
  return simnet.callPublicFn(
    "kolo",
    "contribute",
    [Cl.uint(koloId)],
    sender
  );
}

function triggerPayout(koloId: number = 1, sender: string) {
  return simnet.callPublicFn(
    "kolo",
    "trigger-payout",
    [Cl.uint(koloId)],
    sender
  );
}

function emergencyWithdraw(koloId: number = 1, sender: string) {
  return simnet.callPublicFn(
    "kolo",
    "emergency-withdraw",
    [Cl.uint(koloId)],
    sender
  );
}

function claimSlashShare(koloId: number = 1, sender: string) {
  return simnet.callPublicFn(
    "kolo",
    "claim-slash-share",
    [Cl.uint(koloId)],
    sender
  );
}

function markDefault(koloId: number = 1, user: string, sender: string) {
  return simnet.callPublicFn(
    "kolo",
    "mark-default",
    [Cl.uint(koloId), Cl.principal(user)],
    sender
  );
}

function distributeSlashFunds(koloId: number = 1, sender: string) {
  return simnet.callPublicFn(
    "kolo",
    "distribute-slash-funds",
    [Cl.uint(koloId)],
    sender
  );
}

function advanceBlocks(blocks: number) {
  for (let i = 0; i < blocks; i++) {
    simnet.mineEmptyBlock();
  }
}

// Helper to get STX balance
function getStxBalance(address: string): bigint {
  const assets = simnet.getAssetsMap();
  return assets.get("STX")?.get(address) || 0n;
}

describe("KoloX - Community Savings Platform", () => {
  describe("Basic Kolo Operations", () => {
    it("should create a new kolo", () => {
      const result = createKolo("Savings Circle", 1000000, 1008, 5, 5000, wallet1);
      
      expect(result.result).toBeOk(Cl.uint(1));
      
      // Verify kolo was created
      const kolo = simnet.callReadOnlyFn(
        "kolo",
        "get-kolo",
        [Cl.uint(1)],
        wallet1
      );
      
      const koloData = kolo.result.expectSome().expectTuple();
      expect(koloData["name"]).toBe(Cl.stringAscii("Savings Circle"));
      expect(koloData["creator"]).toBe(Cl.principal(wallet1));
      expect(koloData["amount"]).toBe(Cl.uint(1000000));
      expect(koloData["max-members"]).toBe(Cl.uint(5));
      expect(koloData["active"]).toBe(Cl.bool(true));
    });

    it("should allow members to join before start block", () => {
      createKolo("Test Kolo", 1000000, 1008, 5, 5000, wallet1);
      
      const result = joinKolo(1, wallet2);
      expect(result.result).toBeOk(Cl.bool(true));
      
      // Verify member count increased
      const memberCount = simnet.callReadOnlyFn(
        "kolo",
        "get-member-count",
        [Cl.uint(1)],
        wallet1
      );
      expect(memberCount.result).toBeUint(2);
    });

    it("should not allow joining after start block", () => {
      createKolo("Test Kolo", 1000000, 1008, 5, 100, wallet1);
      
      // Advance past start block
      advanceBlocks(200);
      
      const result = joinKolo(1, wallet2);
      expect(result.result).toBeErr(Cl.uint(103)); // ERR-CANNOT-JOIN
    });
  });

  describe("Contributions and Payouts", () => {
    beforeEach(() => {
      // Create kolo with start block in future
      createKolo("Test Kolo", 1000000, 1008, 3, 1000, wallet1);
      
      // Add members
      joinKolo(1, wallet2);
      joinKolo(1, wallet3);
      
      // Advance to start block
      advanceBlocks(1100);
    });

    it("should allow contributions after start block", () => {
      const result = contribute(1, wallet1);
      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("should track contributions properly", () => {
      contribute(1, wallet1);
      contribute(1, wallet2);
      contribute(1, wallet3);

      const stats = simnet.callReadOnlyFn(
        "kolo",
        "get-kolo-stats",
        [Cl.uint(1)],
        wallet1
      );
      
      const statsData = stats.result.expectSome().expectTuple();
      expect(statsData["total-collected"]).toBeUint(3000000); // 3 * 1,000,000
    });

    it("should prevent double contribution in same round", () => {
      contribute(1, wallet1);
      
      const result = contribute(1, wallet1);
      expect(result.result).toBeErr(Cl.uint(104)); // ERR-ALREADY-PAID
    });

    it("should trigger payout after all contribute", () => {
      // All contribute
      contribute(1, wallet1);
      contribute(1, wallet2);
      contribute(1, wallet3);
      
      // Trigger payout for round 0 (position 0 = creator)
      const result = triggerPayout(1, wallet1);
      expect(result.result).toBeOk(Cl.bool(true));
      
      // Verify recipient received funds
      const memberInfo = simnet.callReadOnlyFn(
        "kolo",
        "get-member-info",
        [Cl.uint(1), Cl.principal(wallet1)],
        wallet1
      );
      
      const memberData = memberInfo.result.expectSome().expectTuple();
      expect(memberData["has-received-payout"]).toBe(Cl.bool(true));
    });
  });

  describe("Emergency Withdrawal Enhancement", () => {
    beforeEach(() => {
      // Create kolo with start block in future
      createKolo("Emergency Test", 1000000, 1008, 4, 1000, wallet1);
      
      // Add members
      joinKolo(1, wallet2);
      joinKolo(1, wallet3);
      joinKolo(1, wallet4);
      
      // Advance to start block
      advanceBlocks(1100);
      
      // First round contributions
      contribute(1, wallet1);
      contribute(1, wallet2);
      contribute(1, wallet3);
      contribute(1, wallet4);
      
      // Trigger payout for round 0 (wallet1 receives)
      triggerPayout(1, wallet1);
    });

    describe("emergency-withdraw", () => {
      it("should allow emergency withdrawal after missed payment deadline", () => {
        // Advance to next round
        advanceBlocks(1100);
        
        // wallet2 misses payment, others contribute
        contribute(1, wallet1);
        contribute(1, wallet3);
        contribute(1, wallet4);
        
        // Advance past deadline
        advanceBlocks(200);
        
        // Get balance before withdrawal
        const balanceBefore = getStxBalance(wallet2);
        
        // Emergency withdraw
        const result = emergencyWithdraw(1, wallet2);
        expect(result.result).toBeOk(Cl.uint(800000)); // 1,000,000 - 20% = 800,000
        
        // Verify funds received (minus 20% penalty)
        const balanceAfter = getStxBalance(wallet2);
        expect(balanceAfter - balanceBefore).toBe(800000n);
        
        // Verify member marked as withdrawn
        const memberInfo = simnet.callReadOnlyFn(
          "kolo",
          "get-member-info",
          [Cl.uint(1), Cl.principal(wallet2)],
          wallet1
        );
        
        const memberData = memberInfo.result.expectSome().expectTuple();
        expect(memberData["withdrawn"]).toBe(Cl.bool(true));
        
        // Verify reputation decreased
        expect(memberData["reputation-score"]).toBeUint(50); // 100 - 50 = 50
      });

      it("should not allow emergency withdrawal without contributions", () => {
        // wallet5 never joined
        const result = emergencyWithdraw(1, wallet5);
        expect(result.result).toBeErr(Cl.uint(102)); // ERR-NOT-MEMBER
      });

      it("should not allow emergency withdrawal if not eligible", () => {
        // wallet1 just received payout, hasn't missed payment
        const result = emergencyWithdraw(1, wallet1);
        expect(result.result).toBeErr(Cl.uint(4001)); // ERR-EMERGENCY-NOT-AVAILABLE
      });

      it("should prevent multiple emergency withdrawals", () => {
        // Advance and miss payment
        advanceBlocks(1100);
        contribute(1, wallet1);
        contribute(1, wallet3);
        contribute(1, wallet4);
        advanceBlocks(200);
        
        // First withdrawal
        emergencyWithdraw(1, wallet2);
        
        // Second attempt
        const result = emergencyWithdraw(1, wallet2);
        expect(result.result).toBeErr(Cl.uint(105)); // ERR-ALREADY-WITHDRAWN
      });
    });

    describe("slash fund distribution", () => {
      beforeEach(() => {
        // Advance to next round
        advanceBlocks(1100);
        
        // wallet2 misses payment
        contribute(1, wallet1);
        contribute(1, wallet3);
        contribute(1, wallet4);
        
        // Advance past deadline
        advanceBlocks(200);
        
        // wallet2 does emergency withdrawal
        emergencyWithdraw(1, wallet2);
      });

      it("should create compensation pool after emergency withdrawal", () => {
        const pool = simnet.callReadOnlyFn(
          "kolo",
          "get-compensation-pool",
          [Cl.uint(1)],
          wallet1
        );
        
        const poolData = pool.result.expectSome().expectTuple();
        expect(poolData["total-slashed"]).toBeUint(200000); // 20% of 1,000,000
        expect(poolData["distributed"]).toBeUint(0);
      });

      it("should allow active members to claim slash shares", () => {
        // Get balances before claim
        const balance1Before = getStxBalance(wallet1);
        const balance3Before = getStxBalance(wallet3);
        const balance4Before = getStxBalance(wallet4);
        
        // wallet1 claims share
        const result1 = claimSlashShare(1, wallet1);
        expect(result1.result).toBeOk(Cl.uint(66666)); // 200,000 / 3 ≈ 66,666
        
        // wallet3 claims share
        const result3 = claimSlashShare(1, wallet3);
        expect(result3.result).toBeOk(Cl.uint(66666));
        
        // wallet4 claims share
        const result4 = claimSlashShare(1, wallet4);
        expect(result4.result).toBeOk(Cl.uint(66666));
        
        // Verify balances increased
        const balance1After = getStxBalance(wallet1);
        const balance3After = getStxBalance(wallet3);
        const balance4After = getStxBalance(wallet4);
        
        expect(balance1After - balance1Before).toBe(66666n);
        expect(balance3After - balance3Before).toBe(66666n);
        expect(balance4After - balance4Before).toBe(66666n);
        
        // Verify pool is empty
        const pool = simnet.callReadOnlyFn(
          "kolo",
          "get-compensation-pool",
          [Cl.uint(1)],
          wallet1
        );
        
        const poolData = pool.result.expectSome().expectTuple();
        expect(poolData["total-slashed"]).toBeUint(200000);
        expect(poolData["distributed"]).toBeUint(200000); // All distributed
      });

      it("should prevent defaulted member from claiming", () => {
        const result = claimSlashShare(1, wallet2); // wallet2 is defaulted
        expect(result.result).toBeErr(Cl.uint(1010)); // ERR-NOT-AUTHORIZED
      });

      it("should prevent double claiming", () => {
        claimSlashShare(1, wallet1);
        
        const result = claimSlashShare(1, wallet1);
        expect(result.result).toBeErr(Cl.uint(1005)); // ERR-INSUFFICIENT-BALANCE (pool empty)
      });
    });

    describe("mark-default", () => {
      beforeEach(() => {
        advanceBlocks(1100);
        contribute(1, wallet1);
        contribute(1, wallet3);
        contribute(1, wallet4);
      });

      it("should allow creator to mark member as default after deadline", () => {
        advanceBlocks(200); // Past deadline
        
        const result = markDefault(1, wallet2, wallet1);
        expect(result.result).toBeOk(Cl.bool(true));
        
        // Verify member info updated
        const memberInfo = simnet.callReadOnlyFn(
          "kolo",
          "get-member-info",
          [Cl.uint(1), Cl.principal(wallet2)],
          wallet1
        );
        
        const memberData = memberInfo.result.expectSome().expectTuple();
        expect(memberData["missed-payments"]).toBeUint(1);
        expect(memberData["reputation-score"]).toBeUint(50); // Slashed
      });

      it("should not allow non-creator to mark default", () => {
        advanceBlocks(200);
        
        const result = markDefault(1, wallet2, wallet3);
        expect(result.result).toBeErr(Cl.uint(1010)); // ERR-NOT-AUTHORIZED
      });

      it("should not mark default before deadline", () => {
        // Haven't advanced past deadline
        const result = markDefault(1, wallet2, wallet1);
        expect(result.result).toBeErr(Cl.uint(4001)); // ERR-EMERGENCY-NOT-AVAILABLE
      });

      it("should not mark member who already paid", () => {
        advanceBlocks(200);
        
        const result = markDefault(1, wallet1, wallet1); // wallet1 paid
        expect(result.result).toBeErr(Cl.uint(104)); // ERR-ALREADY-PAID
      });
    });

    describe("can-emergency-withdraw view function", () => {
      it("should return correct eligibility", () => {
        advanceBlocks(1100);
        contribute(1, wallet1);
        contribute(1, wallet3);
        contribute(1, wallet4);
        advanceBlocks(200);
        
        const result = simnet.callReadOnlyFn(
          "kolo",
          "can-emergency-withdraw",
          [Cl.uint(1), Cl.principal(wallet2)],
          wallet1
        );
        
        expect(result.result).toBeBool(true);
      });

      it("should return false for ineligible member", () => {
        const result = simnet.callReadOnlyFn(
          "kolo",
          "can-emergency-withdraw",
          [Cl.uint(1), Cl.principal(wallet1)], // wallet1 paid
          wallet1
        );
        
        expect(result.result).toBeBool(false);
      });
    });

    describe("calculate-emergency-withdrawal", () => {
      it("should calculate correct amount after slash", () => {
        const result = simnet.callReadOnlyFn(
          "kolo",
          "calculate-emergency-withdrawal",
          [Cl.uint(1), Cl.principal(wallet2)],
          wallet1
        );
        
        const amount = result.result.expectSome().expectUint();
        expect(amount).toBe(800000n); // 1,000,000 - 20%
      });

      it("should return none for non-member", () => {
        const result = simnet.callReadOnlyFn(
          "kolo",
          "calculate-emergency-withdrawal",
          [Cl.uint(1), Cl.principal(wallet5)],
          wallet1
        );
        
        expect(result.result.type).toBe("none");
      });
    });

    describe("edge cases", () => {
      it("should handle multiple defaults in same kolo", () => {
        // Advance multiple rounds with different defaulters
        advanceBlocks(1100);
        contribute(1, wallet1);
        contribute(1, wallet3);
        contribute(1, wallet4);
        advanceBlocks(200);
        
        // wallet2 defaults in round 1
        emergencyWithdraw(1, wallet2);
        
        // Round 2
        advanceBlocks(1100);
        contribute(1, wallet1);
        contribute(1, wallet3);
        contribute(1, wallet4);
        advanceBlocks(200);
        
        // wallet3 defaults in round 2
        emergencyWithdraw(1, wallet3);
        
        // Verify both default records exist
        const default2 = simnet.callReadOnlyFn(
          "kolo",
          "get-default-info",
          [Cl.uint(1), Cl.principal(wallet2)],
          wallet1
        );
        expect(default2.result.isSome()).toBe(true);
        
        const default3 = simnet.callReadOnlyFn(
          "kolo",
          "get-default-info",
          [Cl.uint(1), Cl.principal(wallet3)],
          wallet1
        );
        expect(default3.result.isSome()).toBe(true);
      });

      it("should handle emergency withdrawal with minimum slash amount", () => {
        // Create kolo with very small contribution
        createKolo("Small Kolo", 5000, 1008, 3, 5000, wallet1); // 5,000 sats
        joinKolo(2, wallet2);
        advanceBlocks(5100);
        
        contribute(2, wallet1);
        contribute(2, wallet2);
        
        advanceBlocks(1100);
        contribute(2, wallet1); // wallet2 misses
        advanceBlocks(200);
        
        const result = emergencyWithdraw(2, wallet2);
        // MIN-SLASH-AMOUNT (1000) applies since 20% of 5000 = 1000 exactly
        expect(result.result).toBeOk(Cl.uint(4000)); // 5000 - 1000 = 4000
      });
    });
  });
});
