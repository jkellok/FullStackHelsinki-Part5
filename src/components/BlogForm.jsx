import { useState } from 'react'

const BlogForm = ({ createBlog }) => {
  const [newBlog, setNewBlog] = useState({ title: '', author: '', url: '' })

  const addBlog = (event) => {
    event.preventDefault()
    createBlog({
      title: newBlog.title,
      author: newBlog.author,
      url: newBlog.url
    })

    setNewBlog({ title: '', author: '', url: '' })
  }

  return (
    <div>
      <h2>create new</h2>
      <form onSubmit={addBlog}>
        <div>
          title:
          <input
            name="title"
            placeholder='write title here'
            value={newBlog.title}
            onChange={event => setNewBlog({ ...newBlog, [event.target.name]: event.target.value })}
          />
        </div>
        <div>
          author:
          <input
            name="author"
            placeholder='write author here'
            value={newBlog.author}
            onChange={event => setNewBlog({ ...newBlog, [event.target.name]: event.target.value })}
          />
        </div>
        <div>
          url:
          <input
            name="url"
            placeholder='write url here'
            value={newBlog.url}
            onChange={event => setNewBlog({ ...newBlog, [event.target.name]: event.target.value })}
          />
        </div>
        <button type="submit">create</button>
      </form>
    </div>
  )
}

export default BlogForm