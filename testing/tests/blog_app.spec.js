const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, createBlog } = require('./helper')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3003/api/testing/reset')
    await request.post('http://localhost:3003/api/users', {
      data: {
        name: 'Superuser',
        username: 'root',
        password: 'password'
      }
    })
    await page.goto('http://localhost:5173')
  })

  test('Login form is shown', async ({ page }) => {
    await page.getByRole('button', { name: 'log in' }).click()
    await page.getByTestId('username').fill('root')
    await page.getByTestId('password').fill('password')
    await page.getByRole('button', { name: 'login' }).click()
  })

  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'root', 'password')
      await expect(page.getByText('Superuser logged in')).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'root', 'wrongpassword')
      const errorDiv = await page.locator('.notification-error')
      await expect(errorDiv).toContainText('wrong username or password')
      await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')
      await expect(page.getByText('Superuser logged in')).not.toBeVisible()
    })
  })

  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'root', 'password')
    })

    test('a new blog can be created', async ({ page }) => {
      await createBlog(page, 'test title', 'test author', 'test url')
      const blogDiv = await page.locator('.blog')
      await expect(blogDiv).toContainText('test title test author')
    })

    describe('When a blog exists and details are viewed', () => {
      beforeEach(async ({ page }) => {
        await createBlog(page, 'created blog', 'created author', 'created url')
        const blogDiv = await page.locator('.blog')
        await (blogDiv).getByRole('button', { name: 'view' }).click()
      })

      test('a blog can be edited', async ({ page }) => {
        const blogDetailedDiv = await page.locator('.more-blog-details')
        await expect(blogDetailedDiv).toContainText('likes 0')
        await (blogDetailedDiv).getByRole('button', { name: 'like' }).click()
        await expect(blogDetailedDiv).not.toContainText('likes 0')
        await expect(blogDetailedDiv).toContainText('likes 1')
      })

      test('a blog can be deleted', async ({ page }) => {
        const blogDetailedDiv = await page.locator('.more-blog-details')
        await expect(blogDetailedDiv).toContainText('likes 0')

        page.on('dialog', async dialog => {
          expect(dialog.type()).toContain('confirm')
          expect(dialog.message()).toContain('Remove blog created blog created author?')
          await dialog.accept()
        })
        await page.getByRole('button', { name: 'remove' }).click()
        const notification = await page.locator('.notification')
        await expect(notification).toContainText('removed created blog created author')
      })

      describe('Another user creates blogs', () => {
        beforeEach(async ({ page, request }) => {
          await page.getByRole('button', { name: 'logout' }).click()
          await page.goto('http://localhost:5173')
          await request.post('http://localhost:3003/api/users', {
            data: {
              name: 'Superuser2',
              username: 'root2',
              password: 'password2'
            }
          })
          await loginWith(page, 'root2', 'password2')
          await createBlog(page, 'another blog', 'another author', 'another url')
          await createBlog(page, 'test-title', 'test-author', 'test-url')
          await page.getByText('another blog').getByRole('button', { name: 'view' }).click()
          await page.getByText('test-title').getByRole('button', { name: 'view' }).click()
          await page.getByText('created blog').getByRole('button', { name: 'view' }).click()
        })

        test('user can see remove button only on their own blogs', async ({ page }) => {
          const ownedBlog = page.locator('.blog').filter({ hasText: /another blog/ })
          await expect(ownedBlog).toContainText('Superuser2')
          await expect(ownedBlog).toContainText('remove')
          const notOwnedBlog = page.locator('.blog').filter({ hasText: /created blog/ })
          await expect(notOwnedBlog).not.toContainText('Superuser2')
          await expect(notOwnedBlog).not.toContainText('remove')
        })

        test('blogs are arranged according to likes', async ({ page }) => {
          const blogDiv = await page.locator('.blog').filter({ hasText: /test-title/ })
          await (blogDiv).getByRole('button', { name: 'like' }).click()
          await (blogDiv).getByRole('button', { name: 'like' }).click()
          await expect(blogDiv).toContainText('likes 2')
          const otherBlogDiv = await page.locator('.blog').filter({ hasText: /created blog/ })
          await (otherBlogDiv).getByRole('button', { name: 'like' }).click()
          await expect(otherBlogDiv).toContainText('likes 1')
          // create array of blogs an assert specific order with toContainText arrays
          const blogs = await page.locator('.blog') // array of blogs
          await expect(blogs).toContainText(['likes 2', 'likes 1', 'likes 0'])
          await expect(blogs).not.toContainText(['likes 1', 'likes 0', 'likes 2'])
          await expect(blogs).toContainText(['test-title', 'created blog', 'another blog'])
          await expect(blogs).not.toContainText(['created blog', 'another blog', 'test-title'])
        })
      })
    })
  })
})