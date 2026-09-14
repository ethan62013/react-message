import { Link } from 'react-router'

function NotFound() {
  return (
    <section id="center">
      <div>
        <h1>404</h1>
        <p>This page does not exist.</p>
        <p>
          <Link to="/">Back to home</Link>
        </p>
      </div>
    </section>
  )
}

export default NotFound
