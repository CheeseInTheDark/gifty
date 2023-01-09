import { render, screen } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import GiftShop from '../GiftShop'
import giftExchangeApi from '../api/giftExchange'
import userEvent from '@testing-library/user-event'

jest.mock('../api/giftExchange')

describe(GiftShop, () => {

    let next

    beforeEach(async () => {
        next = jest.fn()

        giftExchangeApi.getItems.mockReturnValue(Promise.resolve([
            {
              "imageUrl": "image 1",
              "inStock": true
            }, {
              "imageUrl": "image 2",
              "inStock": false
            }
        ]))

        giftExchangeApi.selectGift.mockReturnValue(Promise.resolve())

        await act(async () => {
            render(
                <GiftShop 
                    shopper={{identityToken: "token"}} 
                    giftAssignment={{itemWanted: "potato", name: "Josefer"}}
                    next={next}
                />
            )
        })
    })

    it("submits a gift selection after confirmation", async () => {
        const inStockItem = (await screen.findAllByRole('img'))[0]
        await act(async () => { await userEvent.click(inStockItem) })

        const confirmButton = await screen.findByText(/Do eeeet/)
        await act(async () => { await userEvent.click(confirmButton) })

        expect(giftExchangeApi.selectGift).toHaveBeenCalledWith("token", "image 1")
        expect(next).toHaveBeenCalled()
    })

    it("shows a confirmation option when an in-stock gift is chosen", async () => {
        const inStockItem = (await screen.findAllByRole('img'))[0]

        await act(async () => { await userEvent.click(inStockItem) })

        expect(await screen.findByText(/Give this gift/)).toBeVisible()
        // expect(await screen.findByRole("button", { description: "Do eeeet"})).toBeVisible()
        // const confirmationButton = (await screen.findByRole('button', {description: "Do eeet"}))
        // await act(async () => { await userEvent.click(confirmationButton) })
    })

    it("hides the confirmation when someone changes their mind", async () => {
        const inStockItem = (await screen.findAllByRole('img'))[0]
        await act(async () => { await userEvent.click(inStockItem) })

        const closeButton = await screen.findByText("No thanks")
        await act(async () => { await userEvent.click(closeButton) })

        expect(screen.queryByText(/Give this gift/)).toBeNull()
    })

    it("does nothing when an out-of-stock gift is chosen", async () => {
        const outOfStockItem = (await screen.findAllByRole('img'))[1]

        await act(async () => { await userEvent.click(outOfStockItem) })

        expect(screen.queryByText(/Give this gift/)).toBeNull()
    })
})