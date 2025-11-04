'use client';
import { useEffect, useState } from "react";
import axios from 'axios';
// https://dumbstockapi.com/stock?exchanges=NYSE

interface Stock {
    ticker: string
    name: string
}

const Stock = () => {
    const [data, setData] = useState<Stock[] | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)

        const fetchData = async () => {
            await axios.get("https://dumbstockapi.com/stock?exchanges=NYSE")
            .then(response => setData(response.data))
            .finally(() => setLoading(false))
        }

        fetchData()
    }, [])
    
    return (
        <>
            {!loading ? data?.map((item, index) => {
                return <p key={index}>{item.ticker} - {item.name}</p>

            }) : <p>Ca charge...</p>}
        </>
    )
}

export default Stock