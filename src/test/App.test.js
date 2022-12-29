import { act, render, screen } from '@testing-library/react';
import App from '../App';
import recipient from '../api/recipient'
import giftCode from '../api/giftCode'
import userEvent from '@testing-library/user-event';
import giftExchange from '../api/giftExchange'

jest.mock('../api/recipient')
jest.mock('../api/giftCode')
jest.mock('../api/giftExchange')

const recipientData = {
  name: "Boat",
  identityToken: "thetoken"
}

describe("App", () => {

  beforeEach(() => {
    delete window.location
    window.location = {
      href: "http://localhost/redeem/thetoken"
    }


  })

  test("passes the recipient's token to retrieve their info", async () => {
    recipient.get.mockReturnValue(new Promise(resolve => { }))

    render(<App />)

    expect(recipient.get).toHaveBeenCalledWith("thetoken")
  })

  test("waits for the recipient's name to load", async () => {
    recipient.get.mockReturnValue(new Promise(resolve => { }))

    render(<App />)

    await screen.findByText("THE GIFTS ARE LOADING")

    expect(screen.queryByText("THE GIFTS ARE LOADING")).toBeInTheDocument()
  })

  test('asks the recipient to enter their gift card code', async () => {
    recipient.get.mockReturnValue(Promise.resolve(recipientData))

    render(<App />)

    await screen.findByText(/Boat/)

    expect(screen.queryByText(/Boat/)).toBeInTheDocument()
  })

  describe("gift code entry", () => {

    const failureMessage = "Your code, it is wrong.  Your ancestors are ashamed.  You will never live this down"

    beforeEach(async () => {
      recipient.get.mockReturnValue(Promise.resolve(recipientData))

      render(<App />)

      giftCode.redeem.mockImplementation((code, identityToken) => 
        Promise.resolve(code === "1234" && identityToken === "thetoken" ? {
          success: true
        } : {
          success: false,
          message: failureMessage
        }))

      await screen.findByText(/Boat/)
    })

    describe("success", () => {
      beforeEach(async () => {
        await act(async () => {
          await userEvent.click(screen.getByRole("textbox"))
          await userEvent.keyboard("1234")
          await userEvent.click(screen.getByText("Redeem yo'self"))
        })
      })

      it("does not show an error message", async () => {
        expect(screen.queryByText(/Your code, it is wrong/)).toBeNull()
      })

      it("asks what is wanted for Christmas", async () => {
        expect(await screen.findByText(/like for Christmas/))
      })

      it("shows options for Christmas gifts", async () => {
        const wishListChoices = await screen.findAllByTestId("wishlist-choice")

        expect(wishListChoices.length).toBeGreaterThan(0)
        wishListChoices.forEach(choice => expect(choice).toBeInTheDocument())
      })

      describe("followed by selection of what is wanted for Christmas", () => {
        beforeEach(async () => {
          giftExchange.join.mockReturnValue(Promise.resolve({
            "itemWanted": "waterfalls",
            "assignedGiftRecipient": {
              "name": "Farlfarnarsonnur",
              "itemWanted": "something that tastes like grapes but isn't grapes"
            }
          }))

          await userEvent.click(screen.getByText("Something irritating"))
        })

        it("submits the selection", () => {
          expect(giftExchange.join).toHaveBeenCalledWith("Something irritating", "thetoken")
        })
      })
    })

    it("shows an error message if redeeming fails", async () => {
      await act(async () => {
        await userEvent.click(screen.getByRole("textbox"))
        await userEvent.keyboard("1233")
        await userEvent.click(screen.getByText("Redeem yo'self"))
      })

      expect(await screen.findByText(/Your code, it is wrong/)).toBeVisible()
    })

    it("sends the identity token with the code", async () => {
      await act(async () => {
        await userEvent.click(screen.getByRole("textbox"))
        await userEvent.keyboard("1234")
        await userEvent.click(screen.getByText("Redeem yo'self"))
      })

      expect(giftCode.redeem).toHaveBeenCalledWith("1234", "thetoken")
    })
  })
})


