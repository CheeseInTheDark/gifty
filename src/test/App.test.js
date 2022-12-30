import { act, render, screen, waitFor } from '@testing-library/react';
import App from '../App';
import recipient from '../api/recipient'
import giftCode from '../api/giftCode'
import userEvent from '@testing-library/user-event';
import giftExchange from '../api/giftExchange'
import { Cookies } from 'react-cookie'

jest.mock('../api/recipient')
jest.mock('../api/giftCode')
jest.mock('../api/giftExchange')

const recipientData = {
  name: "Boat",
  identityToken: "thetoken"
}

const testImage1 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAAMSURBVBhXY2BgYAAAAAQAAVzN/2kAAAAASUVORK5CYII="
const testImage2 = "data:image/bmp;base64,Qk16AAAAAAAAAHYAAAAoAAAAAQAAAAEAAAABAAQAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAgAAAAICAAIAAAACAAIAAgIAAAICAgADAwMAAAAD/AAD/AAAA//8A/wAAAP8A/wD//wAA////APAAAAA="

const cookies = new Cookies()

function setLocation(location) {
  delete window.location
  window.location = {
    href: location
  }
}

describe("App", () => {

  beforeEach(() => {
    setLocation("http://localhost/redeem/thetoken")

    giftExchange.getItems.mockReturnValue(Promise.resolve([
      {
        "imageUrl": testImage1,
        "inStock": true
      }, {
        "imageUrl": testImage2,
        "inStock": false
      }
    ]))
  })

  afterEach(() => {
    const cookiesToRemove = Object.keys(cookies.getAll())
    cookiesToRemove.forEach(cookie => cookies.remove(cookie))
  })

  test("passes the recipient's token to retrieve their info", () => {
    recipient.get.mockReturnValue(new Promise(resolve => { }))

    render(<App />)

    expect(recipient.get).toHaveBeenCalledWith("thetoken")
  })

  test("retrieves the recipient's info using the cookie if not on the redeem page", () => {
    recipient.get.mockReturnValue(new Promise(resolve => { }))
    setLocation("http://localhost/")
    cookies.set("identityToken", "Whoahhh z z z z")

    render(<App />)

    expect(recipient.get).toHaveBeenCalledWith("Whoahhh z z z z")
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

  describe("when the visitor is anonymous", () => {
    beforeEach(() => {
      recipient.get.mockReturnValue(Promise.resolve())
      giftExchange.get.mockReturnValue(Promise.resolve())
      setLocation("http://localhost/")
    })

    test("shows the tree view", async () => {
      render(<App />)

      expect(await screen.findByAltText("Christmas tree")).toBeVisible()
      expect(await screen.queryByText(/gift for/)).not.toBeInTheDocument()
    })
  
    test("does not fetch the recipient or gift exchange info", async () => {
      render(<App />)
      
      await screen.findByAltText("Christmas tree")

      expect(recipient.get).not.toHaveBeenCalled()
      expect(giftExchange.get).not.toHaveBeenCalled()
    })
  })

  describe("when a card recipient has already redeemed their card", () => {

    beforeEach(() => {
      recipient.get.mockReturnValue(Promise.resolve({
        ...recipientData,
        redeemed: true
      }))
    })

    it("shows wish list item selection if they haven't selected their wish list item yet", async () => {
      render(<App />)

      expect(await screen.findByText(/like for Christmas/)).toBeVisible()
    })

    it("sets a cookie to remember the visitor's identity token", async () => {
      render(<App />)

      await screen.findByText(/like for Christmas/)

      expect(cookies.get("identityToken")).toBe("thetoken")
    })

    describe("and they've selected a wish list item", () => {

      let giftExchangeInfo

      beforeEach(() => {
        giftExchange.get.mockImplementation(identityToken => 
          identityToken === recipientData.identityToken ? Promise.resolve(giftExchangeInfo) : Promise.reject())
      })

      it("shows gift selection if they haven't selected a gift to give yet", async () => {
        giftExchangeInfo = {
          itemWanted: "Toast",
          assignedGiftRecipient: {
            name: "Cousin Bwazor",
            itemWanted: "something that tastes like grapes but isn't grapes"
          }
        }

        render(<App/>)

        expect(await screen.findAllByRole('img')).toEqual([
          expect.toHaveAttribute("src", testImage1), 
          expect.toHaveAttribute("src", testImage2)
        ])
      })

      it("shows the tree view if they have no assigned gift recipient", async () => {
        giftExchangeInfo = {
          itemWanted: "Toast?"
        }

        render(<App/>)

        expect(await screen.findByAltText("Christmas tree")).toBeVisible()
        expect(await screen.queryByText(/gift for/)).not.toBeInTheDocument()
      })

      it("shows the tree view if they've selected a gift to give", async () => {
        giftExchangeInfo = {
          itemWanted: "waterfalls",
          assignedGiftRecipient: {
            name: "Farlfarnarsonnur",
            itemWanted: "something that tastes like grapes but isn't grapes",
            itemReceived: "another image URL"
          }
        }

        render(<App/>)

        expect(await screen.findByAltText("Christmas tree")).toBeVisible()
        expect(await screen.queryByText(/gift for/)).not.toBeInTheDocument()
      })
    })
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

    it("does not set a cookie yet", () => {
      expect(cookies.get("identityToken")).toBeUndefined()
    })

    describe("success", () => {
      beforeEach(async () => {
        await act(async () => {
          await userEvent.click(screen.getByRole("textbox"))
          await userEvent.keyboard("1234")
          await userEvent.click(screen.getByText("Redeem yo'self"))
        })
      })

      it("sets a cookie to remember the visitor's identity token", () => {
        expect(cookies.get("identityToken")).toBe("thetoken")
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
  })
})


