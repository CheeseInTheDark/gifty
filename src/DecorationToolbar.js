import { useState } from "react"

const decorationChoice = (name, url) => ({
    name,
    url: "/images/decoration/" + url
})

const options = [
    decorationChoice("blue bulb", "bluebulb.png"),
    decorationChoice("green bulb", "greenbulb.png"),
    decorationChoice("gold bulb", "goldbulb.png"),
    decorationChoice("red bulb", "redbulb.png"),
]


export default function DecorationToolbar({ onDecorationSelected }) {

    const [currentSelection, setCurrentSelection] = useState()

    function selectDecoration(decoration) {

        const newSelection = currentSelection === decoration ? undefined : decoration

        setCurrentSelection(newSelection)
        onDecorationSelected(newSelection)
    }

    return <div>
        {
            options.map(({name, url}) => 
                <img
                    className={currentSelection === name ? "selected-decoration" : "unselected-decoration"}
                    key={name}
                    src={url}
                    alt={name}
                    onClick={() => selectDecoration(name)}
                />
            )
        }
    </div>
}