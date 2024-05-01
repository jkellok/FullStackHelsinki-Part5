import { useState } from 'react'

const Blog = ({ blog, updateLikes, deleteOneBlog, user }) => {

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  const [detailsVisible, setDetailsVisible] = useState(false)

  const hideWhenVisible = { display: detailsVisible ? 'none' : '' }
  const showWhenVisible = { display: detailsVisible ? '' : 'none' }

  const toggleDetailsVisibility = () => {
    setDetailsVisible(!detailsVisible)
  }

  const increaseLikes = () => {
    updateLikes(blog.id)
  }

  const deleteBlog = () => {
    deleteOneBlog(blog.id)
  }

  return (
    <div style={blogStyle} className='blog'>
      <div style={hideWhenVisible} className='default-blog-details'>
        {blog.title} {blog.author} {' '}
        <button onClick={toggleDetailsVisibility}>view</button>
      </div>
      <div style={showWhenVisible} className='more-blog-details' data-testid='blog-details'>
        {blog.title} {blog.author} {' '}
        <button onClick={toggleDetailsVisibility}>hide</button> <br />
        {blog.url} <br />
        likes {blog.likes} {' '}
        <button onClick={increaseLikes}>like</button> <br />
        {blog.user.name} <br />
        {user.username === blog.user.username &&
          <button onClick={deleteBlog} style={{ backgroundColor: 'orange' }}>remove</button>
        }

      </div>
    </div>
  )
}

export default Blog