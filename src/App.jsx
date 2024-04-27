import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/Notification'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState({ message: null, className: 'notification'})

  const blogFormRef = useRef()

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  useEffect(() => {
    blogService.getAll().then(blogs =>
      setBlogs( blogs.sort((a, b) => b.likes - a.likes) )
    )
  }, [])

  const loginForm = () => (
    <div>
      <h2>log in to application</h2>
      <form onSubmit={handleLogin}>
        <div>
          username
          <input
            type="text"
            value={username}
            name="Username"
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password
          <input
            type="password"
            value={password}
            name="Password"
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )

  const addBlog = (blogObject) => {
    blogFormRef.current.toggleVisibility()
    blogService
      .create(blogObject)
      .then(returnedBlog => {
        setBlogs(blogs.concat(returnedBlog))
        setNotification({
          message: `a new blog ${blogObject.title} ${blogObject.author} added`,
          className: 'notification'
        })
        setTimeout(() => {
          setNotification({ message: null })
        }, 5000)
      })
      .catch(error => {
        setNotification({
          message: 'Error in adding the blog',
          className: 'notification-error'
        })
        setTimeout(() => {
          setNotification({ message: null })
        }, 5000)
      })
/*       blogService.getAll().then(blogs =>
        setBlogs( blogs.sort((a, b) => b.likes - a.likes) )
      ) */
  }

  const updateLikes = (id) => {
    const blog = blogs.find(b => b.id === id)
    const changedBlog = { ...blog, likes: blog.likes + 1 }
    blogService
      .update(id, changedBlog)
      .then(returnedBlog => {
        setNotification({
          message: `liked ${returnedBlog.title} ${returnedBlog.author}, current likes ${returnedBlog.likes}`,
          className: 'notification'
        })
        setTimeout(() => {
          setNotification({ message: null })
        }, 5000)
      })
      .catch(error => {
        console.log("error in updating", error)
        setNotification({
          message: 'Error in liking the blog',
          className: 'notification-error'
        })
        setTimeout(() => {
          setNotification({ message: null })
        }, 5000)
      })

      // fetch blogs with proper user field after updating like count
      blogService.getAll().then(blogs =>
        setBlogs( blogs.sort((a, b) => b.likes - a.likes) )
      )
  }

  const deleteOneBlog = (id) => {
    const blog = blogs.find(b => b.id === id)

    if (window.confirm(`Remove blog ${blog.title} ${blog.author}?`)) {
      blogService
        .deleteBlog(id)
        .then(returnedBlog => {
          console.log("deleted", returnedBlog)
          const blogsAfterDeletion = blogs.filter(b => b.id !== id)
          setBlogs( blogsAfterDeletion )
          setNotification({
            message: `removed ${blog.title} ${blog.author}`,
            className: 'notification'
          })
          setTimeout(() => {
            setNotification({ message: null })
          }, 5000)
        })
        .catch(error => {
          console.log("error in deleting", error)
          setNotification({
            message: 'Error in removing the blog',
            className: 'notification-error'
          })
          setTimeout(() => {
            setNotification({ message: null })
          }, 5000)
        })
    }
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({
        username, password
      })

      window.localStorage.setItem(
        'loggedUser', JSON.stringify(user)
      )
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
      setNotification({
        message: 'login successful',
        className: 'notification'
      })
      setTimeout(() => {
        setNotification({ message: null })
      }, 5000)
    } catch (exception) {
      setNotification({
        message: 'wrong username or password',
        className: 'notification-error'
      })
      setTimeout(() => {
        setNotification({ message: null })
      }, 5000)
    }
  }

  const handleLogout = () => {
    setUser(null)
    window.localStorage.removeItem('loggedUser')
    setNotification({
      message: 'logout successful',
      className: 'notification'
    })
    setTimeout(() => {
      setNotification({ message: null })
    }, 5000)
  }

  const blogList = () => (
    <div>
      {blogs.map(blog =>
        <Blog
          key={blog.id}
          blog={blog}
          updateLikes={updateLikes}
          deleteOneBlog={deleteOneBlog}
          user={user}
          />
      )}
    </div>
  )

  return (
    <div>
      <Notification notification={notification} />
      {user === null ?
        loginForm() :
        <div>
          <h2>blogs</h2>
          <p>{user.name} logged in <span/>
            <button onClick={handleLogout}>logout</button>
          </p>
          <Togglable buttonLabel="new blog" ref={blogFormRef}>
            <BlogForm
              createBlog={addBlog}
            />
          </Togglable>
          {blogList()}
        </div>
      }
    </div>
  )
}

export default App