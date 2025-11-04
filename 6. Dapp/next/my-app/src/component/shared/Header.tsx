import Link from "next/link";

const Header = () => {
  return (
    <div className="flex flex-row gap-4">
      <Link href="/">Home</Link>
      <Link href="/contact">Contact</Link>
      <Link href="/about">About</Link>
    </div>
  )
}

export default Header