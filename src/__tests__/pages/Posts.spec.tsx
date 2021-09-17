import { render, screen } from '@testing-library/react';
import Posts, { getStaticProps } from '../../pages/posts';
import { stripe } from '../../services/stripe';
import { mocked } from 'ts-jest/utils';
import { getPrismicClient } from '../../services/prismic';
jest.mock('../../services/prismic');

const posts = [
  {
    slug: 'my-new-post',
    title: 'my new post',
    excerpt: 'aoba, bão?',
    updatedAt: '14 de setembro',
  },
];

describe('Posts page', () => {
  it('renders correctly', () => {
    render(<Posts posts={posts} />);

    expect(screen.getByText('my new post')).toBeInTheDocument();
  });

  it('loads initial data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);
    getPrismicClientMocked.mockReturnValueOnce({
      query: jest.fn().mockResolvedValueOnce({
        results: [
          {
            uid: 'my-new-post',
            data: {
              title: [{ type: 'heading', text: 'My new post' }],
              content: [{ type: 'paragraph', text: 'Aoooba, bão?' }],
            },
            last_publication_date: '09-14-2021',
          },
        ],
      }),
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          posts: [
            {
              slug: 'my-new-post',
              title: 'My new post',
              excerpt: 'Aoooba, bão?',
              updatedAt: '14 de setembro de 2021',
            },
          ],
        },
      }),
    );
  });
});
