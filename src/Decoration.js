const decorationImages = {
    "blue bulb": "bluebulb.png",
    "red bulb": "redbulb.png",
    "green bulb": "greenbulb.png",
    "gold bulb": "goldbulb.png"
}

export default function Decoration({ type, x, y }) {
    return <img
        style={{
            position: 'absolute', 
            top: y, 
            left: x,
            transform: 'translate(-50%, -50%)'
        }}
        src={`/images/decoration/${decorationImages[type]}`}
        alt={type} 
    />
}