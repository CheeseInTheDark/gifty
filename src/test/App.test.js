import { render, screen } from '@testing-library/react';
import App from '../App';
import getRecipient from '../api/getRecipient'

jest.mock('../api/getRecipient')

const recipientData = {
  name: "Boat"
}



describe("App", () => {
  
  beforeEach(() => {
  })
  
  test("waits for the recipient's name to load", async () => {
    getRecipient.mockReturnValue(new Promise(resolve => {}))

    render(<App/>)

    await screen.findByText("THE GIFTS ARE LOADING")

    expect(screen.queryByText("THE GIFTS ARE LOADING")).toBeInTheDocument()
  })

  test('asks the recipient to enter their gift card code', async () => {
    getRecipient.mockReturnValue(Promise.resolve(recipientData))

    render(<App />)
  
    await screen.findByText(/Boat/)

    expect(screen.queryByText(/Boat/)).toBeInTheDocument()
  })
})


