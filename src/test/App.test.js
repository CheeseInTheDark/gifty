import { act, render, screen, waitFor } from '@testing-library/react';
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

const testImage1 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAAMSURBVBhXY2BgYAAAAAQAAVzN/2kAAAAASUVORK5CYII="
const testImage2 = "data:image/bmp;base64,Qk16AAAAAAAAAHYAAAAoAAAAAQAAAAEAAAABAAQAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAgAAAAICAAIAAAACAAIAAgIAAAICAgADAwMAAAAD/AAD/AAAA//8A/wAAAP8A/wD//wAA////APAAAAA="

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

          giftExchange.getItems.mockReturnValue(Promise.resolve([
            {
              "imageUrl": testImage1,
              "inStock": true
            }, {
              "imageUrl": testImage2,
              "inStock": false
            }
          ]))

          await act(async () => {
            await userEvent.click(screen.getByText("Something irritating"))
          })
        })

        it("submits the selection", () => {
          expect(giftExchange.join).toHaveBeenCalledWith("Something irritating", "thetoken")
        })

        it("displays available gifts from the gift shop", async () => {
          expect(await screen.findAllByRole('img')).toEqual([
            expect.toHaveAttribute("src", testImage1), 
            expect.toHaveAttribute("src", testImage2)
          ])
        })

        it("shows who you're shopping for and what they want", async () => {
          expect(await screen.findByText(/Farlfarnarsonnur/)).toBeVisible()
          expect(await screen.findByText(/something that tastes like grapes but isn't grapes/)).toBeVisible()
        })

        it("does not allow selection of items that are out of stock", async () => {
          const outOfStockItem = (await screen.findAllByRole('img'))[1]
          
          await act(async () => { await userEvent.click(outOfStockItem) })

          expect(giftExchange.selectGift).not.toHaveBeenCalled()
        })

        describe("and selection of a gift to give", () => {
          beforeEach(async () => {
            giftExchange.selectGift.mockReturnValue(Promise.resolve({ success: true }))

            const inStockItem = (await screen.findAllByRole('img'))[0]
          
            await act(async () => { await userEvent.click(inStockItem) })
          })

          it("submits the selected in-stock gift", async () => {
            expect(giftExchange.selectGift).toHaveBeenCalledWith("thetoken", testImage1)
          })
  
          it("shows a message that their gift is on the way", async () => {
            expect(await screen.findByText(/gift for Farlfarnarsonnur/)).toBeVisible()
          })

          describe("and dismissal of the gift message", () => {
            beforeEach(async () => {
              const okayButton = await screen.findByText(/Why are you showing me a popup\?/)

              await act(async () => { await userEvent.click(okayButton)})
            })

            it("shows a christmas tree", async () => {
              expect(await screen.findByAltText("Christmas tree")).toBeVisible()
            })

            it("hides the gift message", async () => {
              await waitFor(async () => {
                expect(await screen.queryByText(/gift for Farlfarnarsonnur/)).not.toBeInTheDocument()
              })
            })
          })
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


