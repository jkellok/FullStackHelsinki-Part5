import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'

describe('<Blog />', () => {
  let container

  beforeEach(() => {
    const blog = {
      title: 'TestTitle',
      author: 'TestAuthor',
      url: 'TestURL',
      likes: 10,
      user: {
        name: 'Name',
        username: 'Username'
      }
    }

    const user = {
      name: 'Name',
      username: 'Username'
    }

    container = render(<Blog blog={blog} user={user} />).container
  })

  test('renders blog title and author by default', () => {
    const element = screen.getByText('TestTitle TestAuthor')
    expect(element).toBeDefined()
  })

  test('doesn\'t render blog url and likes by default', () => {
    // blog url and likes inside div with test id 'blog-details'
    const div = container.querySelector('.more-blog-details')
    expect(div).toHaveStyle('display: none')
  })

  test('blog\'s URL and likes visible after pressing button', async () => {
    const div = container.querySelector('.more-blog-details')
    const user = userEvent.setup()
    const button = screen.getByText('view')
    await user.click(button)

    expect(div).not.toHaveStyle('display: none')
    const element = screen.queryByText('TestURL likes 10', { exact: false })
    expect(element).not.toBeNull()
  })
})

test('like button is pressed twice', async () => {
  const blog = {
    title: 'TestTitle',
    author: 'TestAuthor',
    url: 'TestURL',
    likes: 10,
    user: {
      name: 'Name',
      username: 'Username'
    }
  }

  const user = {
    name: 'Name',
    username: 'Username'
  }
  const mockHandler = vi.fn()
  const user2 = userEvent.setup()
  render(<Blog blog={blog} user={user} updateLikes={mockHandler} />)

  const button =  screen.getByText('view')
  await user2.click(button)

  const likeButton = screen.getByText('like')
  await user2.click(likeButton)
  await user2.click(likeButton)
  expect(mockHandler.mock.calls).toHaveLength(2)
})