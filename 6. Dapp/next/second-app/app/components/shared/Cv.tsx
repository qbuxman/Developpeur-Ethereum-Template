interface CvProps {
    title: string
}

const Cv = ({title}: CvProps) => {
  return (
    <div>{title}</div>
  )
}

export default Cv