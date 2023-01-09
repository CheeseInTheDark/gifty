import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getMouseEvent } from './FakeMouseEvent';

import TreeView from '../TreeView'

import giftExchangeApi from '../api/giftExchange'
import decorationApi from '../api/decorations'
import { Cookies } from 'react-cookie';

const cookies = new Cookies()

jest.mock("../api/giftExchange")
jest.mock("../api/decorations")

describe(TreeView, () => {

    beforeEach(() => {
        cookies.set("identityToken", "I am a token")

        giftExchangeApi.getGivenGifts.mockReturnValue(Promise.resolve([
            { from: "Gorbozzio", to: "Jo", gift: "some image URL" },
            { from: "Zombino", to: "Merger Doogar", gift: "some image URL?" },
            { from: "Garvolos the Magnificent", to: "A consumer of french fries", gift: "are you sure this is an image URL?" }
        ]))

        decorationApi.get.mockReturnValue(Promise.resolve([]))
    })

    afterEach(() => {
        const cookiesToRemove = Object.keys(cookies.getAll())
        cookiesToRemove.forEach(cookie => cookies.remove(cookie))
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
                expect.toHaveAttribute("src", "/images/gift1.png"),
                expect.toHaveAttribute("src", "/images/gift2.png"),
                expect.toHaveAttribute("src", "/images/gift3.png")
            ]))
        })

        describe("on click", () => {
            beforeEach(async () => {
                await act(async () => {
                    render(<TreeView giftExchangeEntry={{}} initialShowGiftSent={false} />)
                })

                const firstGift = (await screen.findAllByRole("img")).find(element => element.getAttribute("src") === "/images/gift2.png")
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

    it("shows decorations that have been placed on the tree", async () => {
        decorationApi.get.mockReturnValue(Promise.resolve([
            { type: "blue bulb", x: 50, y: 500000 },
            { type: "red bulb", x: 0, y: 10 },
        ]))

        await act(async () => {
            render(<TreeView giftExchangeEntry={{}} initialShowGiftSent={false} />)
        })

        const blueBulbImage = (await screen.findAllByRole("img"))
            .filter(img => 
                img.getAttribute("src") === "/images/decoration/bluebulb.png"
                && img.getAttribute("style") !== null
                && img.getAttribute("style") !== undefined
                && /left:\s*50/.test(img.getAttribute("style"))
                && /top:\s*500000/.test(img.getAttribute("style")))

        expect(blueBulbImage).toHaveLength(1)

        const redBulbImage = (await screen.findAllByRole("img"))
            .filter(img => 
                img.getAttribute("src") === "/images/decoration/redbulb.png"
                && img.getAttribute("style") !== null
                && img.getAttribute("style") !== undefined
                && /left:\s*0/.test(img.getAttribute("style"))
                && /top:\s*10/.test(img.getAttribute("style")))

        expect(redBulbImage).toHaveLength(1)
    })

    it("displays decorations to choose from", async () => {
        await act(async () => {
            render(<TreeView giftExchangeEntry={{}} initialShowGiftSent={false} />)
        })

        await screen.findAllByRole("img")

        expect(await screen.findAllByRole("img")).toEqual(expect.arrayContaining([
            expect.toHaveAttribute("src", "/images/decoration/bluebulb.png"),
            expect.toHaveAttribute("src", "/images/decoration/greenbulb.png"),
            expect.toHaveAttribute("src", "/images/decoration/redbulb.png"),
            expect.toHaveAttribute("src", "/images/decoration/goldbulb.png")
        ]))
    })

    it("does not display decorations to choose from if the user is anonymous", async () => {
        cookies.remove("identityToken")

        await act(async () => {
            render(<TreeView giftExchangeEntry={{}} initialShowGiftSent={false} />)
        })

        await screen.findAllByRole("img")

        expect(await screen.findAllByRole("img")).not.toEqual(expect.arrayContaining([
            expect.toHaveAttribute("src", "/images/decoration/bluebulb.png"),
            expect.toHaveAttribute("src", "/images/decoration/greenbulb.png"),
            expect.toHaveAttribute("src", "/images/decoration/redbulb.png"),
            expect.toHaveAttribute("src", "/images/decoration/goldbulb.png")
        ]))
    })

    describe("when a decoration is placed", () => {
        beforeEach(async () => {
            await act(async () => {
                render(<TreeView giftExchangeEntry={{}} initialShowGiftSent={false} />)
            })
    
            const blueBulb = await screen.findByAltText("blue bulb")
            await userEvent.click(blueBulb)

            const tree = await screen.findByAltText("Christmas tree")
           
            await act(() => {
                fireEvent(tree, getMouseEvent('click', {
                    offsetX: 10,
                    offsetY: 50
                }))
            })
        })

        test("the selected decoration is displayed where the tree was clicked", async () => {
            const blueBulbImages = (await screen.findAllByRole("img"))
                .filter(img => 
                    img.getAttribute("src") === "/images/decoration/bluebulb.png"
                    && img.getAttribute("style") !== null
                    && img.getAttribute("style") !== undefined
                    && /left:\s*10/.test(img.getAttribute("style"))
                    && /top:\s*50/.test(img.getAttribute("style")))

            expect(blueBulbImages).toHaveLength(1)
        })

        test("the decoration is saved", async () => {
            expect(decorationApi.add).toHaveBeenCalledWith({
                type: "blue bulb",
                x: 10,
                y: 50
            }, "I am a token")
        })
    })
})