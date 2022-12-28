import { act, render, screen } from '@testing-library/react';
import App from '../App';
import recipient from '../api/recipient'
import giftCode from '../api/giftCode'
import userEvent from '@testing-library/user-event';

jest.mock('../api/recipient')
jest.mock('../api/giftCode')

const recipientData = {
  name: "Boat"
}


describe("App", () => {

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

      giftCode.redeem.mockImplementation(code => Promise.resolve(code === "1234" ? {
        success: true
      } : {
        success: false,
        message: failureMessage
      }))

      await screen.findByText(/Boat/)
    })

    it("shows an error message if redeeming fails", async () => {
      await act(async  () => {
        await userEvent.click(screen.getByRole("textbox"))
        await userEvent.keyboard("1233")
        await userEvent.click(screen.getByText("REDEEEEEEM"))
      })

      expect(await screen.findByText(/Your code, it is wrong/)).toBeVisible()
    })
  })
})


