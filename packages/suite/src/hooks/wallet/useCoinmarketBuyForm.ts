import { createContext, useContext, useCallback, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useInvityAPI } from '@wallet-hooks/useCoinmarket';
import * as coinmarketBuyActions from '@wallet-actions/coinmarketBuyActions';
import { useActions } from '@suite-hooks';
import { buildOption } from '@wallet-utils/coinmarket/coinmarketUtils';
import regional from '@wallet-constants/coinmarket/regional';
import { BuyTradeQuoteRequest } from 'invity-api';
import invityAPI from '@suite-services/invityAPI';
import * as routerActions from '@suite-actions/routerActions';
import { getAmountLimits, processQuotes } from '@wallet-utils/coinmarket/buyUtils';
import {
    FormState,
    Props,
    AmountLimits,
    BuyFormContextValues,
} from '@wallet-types/coinmarketBuyForm';
import { useFormDraft } from '@wallet-hooks/useFormDraft';
import useDebounce from 'react-use/lib/useDebounce';

export const BuyFormContext = createContext<BuyFormContextValues | null>(null);
BuyFormContext.displayName = 'CoinmarketBuyContext';

export const useCoinmarketBuyForm = (props: Props): BuyFormContextValues => {
    const { selectedAccount } = props;
    const { buyInfo } = useInvityAPI();
    const { account, network } = selectedAccount;
    const [amountLimits, setAmountLimits] = useState<AmountLimits | undefined>(undefined);
    const { saveDraft, getDraft, removeDraft } = useFormDraft<FormState>('coinmarket-buy');
    const defaultValues = getDraft(selectedAccount.account.key);
    const methods = useForm<FormState>({
        mode: 'onChange',
        defaultValues,
    });

    const { saveQuoteRequest, saveQuotes, saveCachedAccountInfo, saveTrade, goto } = useActions({
        saveQuoteRequest: coinmarketBuyActions.saveQuoteRequest,
        saveQuotes: coinmarketBuyActions.saveQuotes,
        saveCachedAccountInfo: coinmarketBuyActions.saveCachedAccountInfo,
        saveTrade: coinmarketBuyActions.saveTrade,
        goto: routerActions.goto,
    });

    const {
        register,
        control,
        formState: { isValidating, isDirty },
        errors,
    } = methods;

    const values = useWatch<FormState>({ control });

    useDebounce(
        () => {
            if (isDirty && !isValidating && Object.keys(errors).length === 0) {
                saveDraft(selectedAccount.account.key, values as FormState);
            }
        },
        200,
        [errors, saveDraft, selectedAccount.account.key, values, isValidating, isDirty],
    );

    const onSubmit = async () => {
        const formValues = methods.getValues();
        const fiatStringAmount = formValues.fiatInput;
        const cryptoStringAmount = formValues.cryptoInput;
        const wantCrypto = !fiatStringAmount;
        const request: BuyTradeQuoteRequest = {
            wantCrypto,
            fiatCurrency: formValues.currencySelect.value.toUpperCase(),
            receiveCurrency: formValues.cryptoSelect.value,
            country: formValues.countrySelect.value,
            fiatStringAmount,
            cryptoStringAmount,
        };
        await saveQuoteRequest(request);
        await saveCachedAccountInfo(account.symbol, account.index, account.accountType);
        const allQuotes = await invityAPI.getBuyQuotes(request);
        const [quotes, alternativeQuotes] = processQuotes(allQuotes);
        const limits = getAmountLimits(request, quotes);

        if (limits) {
            setAmountLimits(limits);
        } else {
            await saveQuotes(quotes, alternativeQuotes);
            goto('wallet-coinmarket-buy-offers', {
                symbol: account.symbol,
                accountIndex: account.index,
                accountType: account.accountType,
            });
        }
    };

    const country = buyInfo?.buyInfo?.country || regional.unknownCountry;
    const defaultCountry = {
        label: regional.countriesMap.get(country),
        value: country,
    };
    const defaultCurrencyInfo = buyInfo?.buyInfo?.suggestedFiatCurrency;
    const defaultCurrency = defaultCurrencyInfo
        ? buildOption(defaultCurrencyInfo)
        : { label: 'USD', value: 'usd' };

    const typedRegister = useCallback(<T>(rules?: T) => register(rules), [register]);
    const isLoading = !buyInfo || !buyInfo?.buyInfo;
    const noProviders =
        !isLoading &&
        (buyInfo?.buyInfo?.providers.length === 0 ||
            !buyInfo?.supportedCryptoCurrencies.has(account.symbol));

    return {
        ...methods,
        account,
        onSubmit,
        defaultCountry,
        defaultCurrency,
        register: typedRegister,
        buyInfo,
        saveQuotes,
        saveTrade,
        amountLimits,
        setAmountLimits,
        isLoading,
        noProviders,
        network,
        cryptoInputValue: values.cryptoInput,
        removeDraft,
        isDirty,
    };
};

export const useCoinmarketBuyFormContext = () => {
    const context = useContext(BuyFormContext);
    if (context === null) throw Error('BuyFormContext used without Context');
    return context;
};
