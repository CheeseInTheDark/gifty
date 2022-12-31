import giftExchangeApi from "./api/giftExchange"

const wishListPrompt = "Your captive funds card has been successfully redeemed.  Before painfully extracting a small portion of the captive funds from us in the form of merchandise, tell us what you'd like for Christmas!"

const choices = [
    "Something that makes me feel groovy",
    "Something really bright",
    "Something gross",
    "Something slightly off",
    "Something amazingly unremarkable",
    "Something cute",
    "Something horrifying",
    "Something that you would look sideways at",
    "Something I wish was real",
    "Something relaxing",
    "A way to explore the galaxy",
    "Small objects",
    "Something that I can reconfigure to be how I want",
    "Something that has two ends and only two ends",
    "Something that makes me think maybe I should run away quickly",
    "Something irritating",
    "A vaguely basket-shaped object",
    "Some kind of liquid",
    "Something that will allow me to survive if I'm trapped under Arctic sea ice",
    "Something to talk about",
    "Something that'll help me sleep better",
    "Nachos",
    "Something I can use to go very fast",
    "Something incredibly ridiculous",
    "A thing I would never think someone would give me",
    "Something red",
    "Something that is many things connected together",
    "Something cold",
    "Something that can vary wildly in size",
    "Something goopy",
    "Something unyielding",
    "Something flat",
    "Something that I'm completely indifferent about",
    "Some kind of garden",
    "Something I can use to measure something",
    "Something that makes me sleepy",
    "Something that could technically be a boat",
    "Something I might find at a flea market",
    "Something completely irrelevant",
    "Something I can use to make art",
    "Something that makes me feel good about life",
    "Something delicious",
    "Something dichotomous",
    "Something kinda flakey",
    "Something to match my mood",
]

export default function WishlistEntry({ recipient, next }) {

    async function submit(choice) {
        const giftExchangeEntry = await giftExchangeApi.join(choice, recipient.identityToken)
        next(giftExchangeEntry)
    }

    return <>
        <div>{wishListPrompt}</div>
        <div className="stack-of-things" >
        {
            choices.map((choice, index) => 
                <button data-testid="wishlist-choice" onClick={() => submit(choice)} key={index}>{choice}</button>)
        }
        </div>
    </>
}