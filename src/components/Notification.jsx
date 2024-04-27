const Notification = (props) => {
  const message = props.notification.message
  const className = props.notification.className

  if (message === null) {
    return null
  }

  return (
    <div className={className}>
      {message}
    </div>
  )
}

export default Notification