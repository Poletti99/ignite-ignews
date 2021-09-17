import { render, screen } from '@testing-library/react';
import Post, { getServerSideProps } from '../../pages/posts/[slug]';
import { stripe } from '../../services/stripe';
import { mocked } from 'ts-jest/utils';
import { getPrismicClient } from '../../services/prismic';
import { getSession } from 'next-auth/client';

jest.mock('../../services/prismic');
jest.mock('next-auth/client');

const post = {
  slug: 'my-new-post',
  title: 'my new post',
  content: '<p>aoba, bão?</p>',
  updatedAt: '14 de setembro',
};

describe('Post page', () => {
  it('renders correctly', () => {
    render(<Post post={post} />);

    expect(screen.getByText('my new post')).toBeInTheDocument();
    expect(screen.getByText('aoba, bão?')).toBeInTheDocument();
  });

  it('redirects user if no subscription is found', async () => {
    const getSessionMocked = mocked(getSession);
    getSessionMocked.mockResolvedValueOnce(null);

    const response = await getServerSideProps({
      params: { slug: 'my-new-post' },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: '/posts/preview/my-new-post',
        }),
      }),
    );
  });

  it('loads initial data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);
    const getSessionMocked = mocked(getSession);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: 'heading', text: 'My new post' }],
          content: [{ type: 'paragraph', text: 'Aoooba, bão?' }],
        },
        last_publication_date: '09-16-2021',
      }),
    } as any);

    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-active-subscription',
    } as any);

    const response = await getServerSideProps({
      params: { slug: 'my-new-post' },
    } as any);

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-new-post',
            title: 'My new post',
            content: '<p>Aoooba, bão?</p>',
            updatedAt: '16 de setembro de 2021'
          }
        }
      }),
    );
  });
});
