import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
    name: "Can mint tokens to recipient",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('token', 'mint', [types.uint(1000), types.principal(wallet1.address)], deployer.address)
        ]);
        
        block.receipts[0].result.expectOk();
    },
});

Clarinet.test({
    name: "Can transfer tokens between wallets",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        const wallet2 = accounts.get('wallet_2')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('token', 'mint', [types.uint(1000), types.principal(wallet1.address)], deployer.address),
            Tx.contractCall('token', 'transfer', [types.uint(500), types.principal(wallet1.address), types.principal(wallet2.address)], wallet1.address)
        ]);
        
        block.receipts[1].result.expectOk();
    },
});

Clarinet.test({
    name: "Can check balance",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('token', 'mint', [types.uint(1000), types.principal(wallet1.address)], deployer.address)
        ]);
        
        let balance = chain.callReadOnlyFn('token', 'get-balance', [types.principal(wallet1.address)], wallet1.address);
        balance.result.expectOk().expectUint(1000);
    },
});

Clarinet.test({
    name: "Can burn tokens",
    async fn(chain: Chain, accounts: Map<string, Account>) {
        const deployer = accounts.get('deployer')!;
        const wallet1 = accounts.get('wallet_1')!;
        
        let block = chain.mineBlock([
            Tx.contractCall('token', 'mint', [types.uint(1000), types.principal(wallet1.address)], deployer.address),
            Tx.contractCall('token', 'burn', [types.uint(300)], wallet1.address)
        ]);
        
        block.receipts[1].result.expectOk();
        
        let balance = chain.callReadOnlyFn('token', 'get-balance', [types.principal(wallet1.address)], wallet1.address);
        balance.result.expectOk().expectUint(700);
    },
});
