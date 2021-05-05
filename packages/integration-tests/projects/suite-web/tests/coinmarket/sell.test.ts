// @group:coinmarket

describe('Coinmarket sell', () => {
    beforeEach(() => {
        cy.task('stopEmu');
        cy.task('stopBridge');
        cy.task('startBridge');
        cy.task('startEmu', { wipe: true });
        cy.task('setupEmu', { needs_backup: false });
        cy.viewport(1024, 768).resetDb();
        cy.prefixedVisit('/accounts/coinmarket/sell/#/btc/0');
        cy.passThroughInitialRun();
    });

    it('Should sell crypto successfully', () => {
        cy.getTestElement('@coinmarket/sell/crypto-input').type('0.005');
        // TODO: We need to connect to regtest blockchain so we can mock accounts as not empty and continue with sell process
    });
});
