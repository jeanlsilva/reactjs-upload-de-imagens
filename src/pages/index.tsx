import { Button, Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';

import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';
import { AxiosResponse } from 'axios';

interface PageProps {
  pageParam?: {
    id: string;
  }
}

interface QueryResponse {
  after?: {
    id: string;
  },
  data: {
    title: string;
    description: string;
    url: string;
    ts: number;
    id: string
  }[];
}

export default function Home(): JSX.Element {
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery(
    'images',
    async ({ pageParam = null }: PageProps) => {
      let response: AxiosResponse<QueryResponse>;
      if (pageParam) {
        response = await api.get('/api/images', {
          params: {
            after: pageParam,
          }
        });
      } else {
        response = await api.get('/api/images');
      }

      return response.data;
    }
    ,{
      getNextPageParam: (({ after }) => {
        if (after) {
          return after;
        }

        return null;
      })
    }
  );

  const formattedData = useMemo(() => {

    const arr = {
      cards: data?.pages.map(page =>
        page.data.map(({ title, description, url, id, ts }) => {
          return {
            title,
            description,
            url,
            ts,
            id,
          }
        })).flat(2)
    };

    return arr.cards;
  }, [data]);


  return (
    isLoading ? (
      <Loading />
    ) : isError ? (
      <Error />
    ) : (
      <>
        <Header />

        <Box maxW={1120} px={20} mx="auto" my={20}>
          <CardList cards={formattedData} />
          {
            hasNextPage && (
              <Button
                isLoading={isFetchingNextPage}
                isDisabled={isFetchingNextPage}
                loadingText='Loading...'
                mt={10}
                name="Carregar mais"
                onClick={() => fetchNextPage()}
              >
                Carregar mais
              </Button>
            )
          }
        </Box>
      </>
    )
  );
}
