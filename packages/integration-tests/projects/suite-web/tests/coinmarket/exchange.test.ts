// @group:coinmarket

describe('Coinmarket exchange', () => {
    beforeEach(() => {
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

    it('Should show same crypto currency as it has been chosen (BTC)', () => {
        // Cannot easily check selected account for now. Rely on URI.
        cy.prefixedVisit('/accounts/coinmarket/exchange/#/btc/0');
        cy.getTestElement('@coinmarket/exchange/crypto-currency-select/input').contains('BTC');
    });
});
