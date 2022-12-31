import { act, render, screen } from '@testing-library/react';
import TreeView from '../TreeView'

import giftExchangeApi from '../api/giftExchange'
import userEvent from '@testing-library/user-event';

jest.mock("../api/giftExchange")

describe(TreeView, () => {

    beforeEach(() => {
        giftExchangeApi.getGivenGifts.mockReturnValue(Promise.resolve([
            { from: "Gorbozzio", to: "Jo", gift: "some image URL" },
            { from: "Zombino", to: "Merger Doogar", gift: "some image URL?" },
            { from: "Garvolos the Magnificent", to: "A consumer of french fries", gift: "are you sure this is an image URL?" }
        ]))
    })

    it("shows the gift message when it's enabled", async () => {
        await act(async () => {
            render(<TreeView giftExchangeEntry={{ assignedGiftRecipient: { name: "Flerb" }}} initialShowGiftSent={true} />)
        })

        expect(await screen.queryByText(/gift for Flerb/)).toBeInTheDocument()
    })

    it("does not show the gift message if it's disabled", async () => {
        await act(async () => {
            render(<TreeView giftExchangeEntry={{ assignedGiftRecipient: { name: "Flerb" }}} initialShowGiftSent={false} />)
        })

        expect(await screen.queryByText(/gift for Flerb/)).not.toBeInTheDocument()
    })

    describe("the gifts under tree", () => {
        it("shows the gifts under the tree", async () => {
            await act(async () => {
                render(<TreeView giftExchangeEntry={{}} initialShowGiftSent={false} />)
            })

            await screen.findAllByRole("img")

            expect(await screen.findAllByRole("img")).toEqual(expect.arrayContaining([
                expect.toHaveAttribute("src", "images/gift1.png"),
                expect.toHaveAttribute("src", "images/gift2.png"),
                expect.toHaveAttribute("src", "images/gift3.png")
            ]))
        })

        describe("on click", () => {
            beforeEach(async () => {
                await act(async () => {
                    render(<TreeView giftExchangeEntry={{}} initialShowGiftSent={false} />)
                })

                const firstGift = (await screen.findAllByRole("img")).find(element => element.getAttribute("src") === "images/gift2.png")
                await userEvent.click(firstGift)
            })

            it("show the gift giver and recipient", async () => {
                expect(await screen.findByText(/From Zombino/)).toBeVisible()
                expect(await screen.findByText(/To Merger Doogar/)).toBeVisible()
            })
    
            it("show what's in the box", async () => {
                expect(await screen.findAllByRole("img")).toContainEqual(expect.toHaveAttribute("src", "some image URL?"))
            })

            it("hides the gift info when the dialog is clicked", async () => {
                const closeButton = await screen.findByText(/You can make this box go away now/)
                
                await act(async () => {
                    await userEvent.click(closeButton)
                })

                expect(screen.queryByText(/From Zombino/)).toBeNull()
                expect(screen.queryByText(/To Merger Doogar/)).toBeNull()
                expect(screen.queryAllByRole("img")).not.toContainEqual(expect.toHaveAttribute("src", "some image URL?"))
            })
        })

    })
})