'use client';
import { useState, useEffect } from "react"
import Link from "next/link";

const Game = () => {

    const [number, setNumber] = useState(0)

    const increment = () => {
        setNumber(number => number + 1)
    }

    useEffect(() => {
        console.log('Changement de number')
    }, [number])

    useEffect(() => {
        console.log('Page chargee')
    }, [])

    useEffect(() => {
        console.log('Quelque chose a change')
    })

    useEffect(() => () => console.log('Le composant est demonte'), [])

    return (
        <>
            <div>Game {number}</div>
            <button onClick={increment}>Incrémenter</button>
            <Link href="/">HOME</Link>
        </>
    )
}

export default Game