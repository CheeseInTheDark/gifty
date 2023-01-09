import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DecorationToolbar from '../DecorationToolbar'

describe(DecorationToolbar, () => {

    let decorationSelected

    beforeEach(() => {
        decorationSelected = jest.fn()

        render(<DecorationToolbar onDecorationSelected={decorationSelected} />)
    })

    it("reports when the blue bulb is clicked", async () => {
        const blueBulb = await screen.findByAltText("blue bulb")

        await userEvent.click(blueBulb)

        expect(decorationSelected).toHaveBeenCalledWith("blue bulb")
    })

    it("reports when the red bulb is clicked", async () => {
        const redBulb = await screen.findByAltText("red bulb")

        await userEvent.click(redBulb)

        expect(decorationSelected).toHaveBeenCalledWith("red bulb")
    })

    it("reports when the green bulb is clicked", async () => {
        const greenBulb = await screen.findByAltText("green bulb")

        await userEvent.click(greenBulb)

        expect(decorationSelected).toHaveBeenCalledWith("green bulb")
    })

    it("reports when the gold bulb is clicked", async () => {
        const goldBulb = await screen.findByAltText("gold bulb")

        await userEvent.click(goldBulb)

        expect(decorationSelected).toHaveBeenCalledWith("gold bulb")
    })

    it("reports when the current decoration is deselected", async () => {
        const greenBulb = await screen.findByAltText("green bulb")

        await userEvent.click(greenBulb)
        await userEvent.click(greenBulb)

        expect(decorationSelected).toHaveBeenCalledWith(undefined)
    })

    it("highlights the selected decoration", async () => {
        const goldBulb = await screen.findByAltText("gold bulb")

        await userEvent.click(goldBulb)

        expect(await screen.findByAltText("gold bulb")).toHaveClass("selected-decoration")
    })

    it("does not highlight unselected decorations", async () => {
        const goldBulb = await screen.findByAltText("gold bulb")

        await userEvent.click(goldBulb)

        expect(await screen.findByAltText("green bulb")).toHaveClass("unselected-decoration")
    })
})