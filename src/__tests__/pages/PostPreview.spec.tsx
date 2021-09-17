import { render, screen } from '@testing-library/react';
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]';
import { stripe } from '../../services/stripe';
import { mocked } from 'ts-jest/utils';
import { getPrismicClient } from '../../services/prismic';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';

jest.mock('../../services/prismic');
jest.mock('next-auth/client');
jest.mock('next/router');

const post = {
  slug: 'my-new-post',
  title: 'my new post',
  content: '<p>aoba, bão?</p>',
  updatedAt: '14 de setembro',
};

describe('Post Preview page', () => {
  it('renders correctly', () => {
    const useSessionMocked = mocked(useSession);
    useSessionMocked.mockReturnValueOnce([null, false]);

    render(<Post post={post} />);

    expect(screen.getByText('my new post')).toBeInTheDocument();
    expect(screen.getByText('aoba, bão?')).toBeInTheDocument();
    expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument();
  });

  it('redirects user to full post when user is subscribed', async () => {
    const useSessionMocked = mocked(useSession);
    const useRouterMocked = mocked(useRouter);
    const pushMocked = jest.fn();

    useRouterMocked.mockReturnValueOnce({
      push: pushMocked,
    } as any);

    useSessionMocked.mockReturnValueOnce([
      { activeSubscription: 'fakezada' },
      false,
    ]);

    render(<Post post={post} />);

    expect(pushMocked).toBeCalledWith('/posts/my-new-post');
  });

  it('loads initial data', async () => {
    const getPrismicClientMocked = mocked(getPrismicClient);

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [{ type: 'heading', text: 'My new post' }],
          content: [{ type: 'paragraph', text: 'Aoooba, bão?' }],
        },
        last_publication_date: '09-16-2021',
      }),
    } as any);

    const response = await getStaticProps({ params: { slug: 'my-new-post' } });

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-new-post',
            title: 'My new post',
            content: '<p>Aoooba, bão?</p>',
            updatedAt: '16 de setembro de 2021',
          },
        },
      }),
    );
  });
});
