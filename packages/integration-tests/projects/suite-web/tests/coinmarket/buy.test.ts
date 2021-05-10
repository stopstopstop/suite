// @group:coinmarket

describe('Coinmarket buy', () => {
    beforeEach(() => {
        cy.task('startBridge');
        cy.task('startEmu', { wipe: true });
        cy.task('setupEmu', { needs_backup: false });
        cy.viewport(1024, 768).resetDb();
        cy.prefixedVisit('/accounts/coinmarket/buy/');
        cy.passThroughInitialRun();
    });

    it('Should buy crypto successfully', () => {
        cy.getTestElement('@coinmarket/buy/fiat-input').type('1000');
        cy.getTestElement('@coinmarket/buy/fiat-currency-select/input').click();
        cy.getTestElement('@coinmarket/buy/fiat-currency-select/option/usd').click();
        cy.getTestElement('@coinmarket/buy/country-select/input').click();
        cy.getTestElement('@coinmarket/buy/country-select/option/US').click();
        cy.getTestElement('@coinmarket/buy/show-offers-button').click();
        cy.getTestElement('@coinmarket/buy/offers/get-this-deal-button').first().click();
        cy.getTestElement('@coinmarket/buy/offers/buy-terms-agree-checkbox').click();
        cy.getTestElement('@coinmarket/buy/offers/buy-terms-confirm-button').click();
        cy.getTestElement('@coinmarket/buy/offers/confirm-on-trezor-button').click();
        cy.task('pressYes');

        // cy.getTestElement('@coinmarket/buy/offers/finish-transaction-button').click();
        // TODO: click buy button on mocked server
        // TODO: check the UI in suite for completed tx
    });

    it('Should show same crypto currency as it has been chosen (BTC)', () => {
        // Cannot easily check selected account for now. Rely on URI.
        cy.prefixedVisit('/accounts/coinmarket/buy/#/btc/0');
        cy.getTestElement('@coinmarket/buy/crypto-currency-select/input').contains('BTC');
    });
});
