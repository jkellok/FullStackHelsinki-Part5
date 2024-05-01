import { render, screen } from '@testing-library/react'
import BlogForm from './BlogForm'
import userEvent from '@testing-library/user-event'

test('<BlogForm /> updates parent state and calls onSubmit', async () => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  render(<BlogForm createBlog={createBlog} />)

  const inputTitle = screen.getByPlaceholderText('write title here')
  const inputAuthor = screen.getByPlaceholderText('write author here')
  const inputUrl = screen.getByPlaceholderText('write url here')
  const sendButton = screen.getByText('create')

  await user.type(inputTitle, 'testTitle')
  await user.type(inputAuthor, 'testAuthor')
  await user.type(inputUrl, 'testURL')
  await user.click(sendButton)

  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0].title).toBe('testTitle')
  expect(createBlog.mock.calls[0][0].author).toBe('testAuthor')
  expect(createBlog.mock.calls[0][0].url).toBe('testURL')
})