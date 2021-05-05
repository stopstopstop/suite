// @group:coinmarket

describe('Coinmarket exchange', () => {
    beforeEach(() => {
        cy.task('stopEmu');
        cy.task('stopBridge');
        cy.task('startBridge');
        cy.task('startEmu', { wipe: true });
        cy.task('setupEmu', { needs_backup: false });
        cy.viewport(1024, 768).resetDb();
        cy.prefixedVisit('/accounts/coinmarket/exchange/#/btc/0');
        cy.passThroughInitialRun();
    });

    it('Should exchange crypto successfully', () => {
        cy.getTestElement('@coinmarket/exchange/crypto-input').type('0.005');
        // TODO: We need to connect to regtest blockchain so we can mock accounts as not empty and continue with exchange process
    });
});
