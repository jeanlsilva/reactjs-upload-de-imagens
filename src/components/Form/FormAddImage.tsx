import { Box, Button, Stack, useToast } from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';

import { api } from '../../services/api';
import { FileInput } from '../Input/FileInput';
import { TextInput } from '../Input/TextInput';

interface FormAddImageProps {
  closeModal: () => void;
}

interface CreateImageFormData {
  image: FileList;
  title: string;
  description: string;
}

export function FormAddImage({ closeModal }: FormAddImageProps): JSX.Element {
  const [imageUrl, setImageUrl] = useState('');
  const [localImageUrl, setLocalImageUrl] = useState('');
  const toast = useToast();

  const formValidations = {
    image: {
      required: 'Campo obrigatório',
      validate: {
        lessThan10MB: (data: FileList) => data[0].size < 10000000 || 'O arquivo deve ser menor que 10MB',
        acceptedFormats: (data: FileList) => data[0].type.match(/image\/jpg|image\/jpeg|image\/png|image\/gif/) !== null || 'Somente são aceitos arquivos PNG, JPEG e GIF'
      }
    },
    title: {
      required: 'Campo obrigatório',
      minLength: {
        value: 2,
        message: 'Mínimo de 2 caracteres',
      },
      maxLength: {
        value: 20,
        message: 'Máximo de 20 caracteres',
      }
    },
    description: {
      required: 'Campo obrigatório',
      maxLength: {
        value: 65,
        message: 'Máximo de 65 caracteres',
      },
    },
  };

  const queryClient = useQueryClient();
  const mutation = useMutation(
    async ({ title, description }: CreateImageFormData) => {
      const response = await api.post('/api/images', {
        url: imageUrl,
        title,
        description,
      });

      return response.data;
    },
    {
      onSuccess: () => {
        toast({ title: 'Sucesso!', description: 'Imagem cadastrada com sucesso!' });
        queryClient.invalidateQueries('images');
      },
    }
  );

  const {
    register,
    handleSubmit,
    reset,
    formState,
    setError,
    trigger,
  } = useForm();
  const { errors } = formState;

  const onSubmit: SubmitHandler<CreateImageFormData> = async (data) => {
    try {
      if (!imageUrl) {
        toast({
          title: 'Imagem não adicionada',
          description: 'É preciso adicionar e aguardar o upload de uma imagem antes de realizar o cadastro'
        });

        return;
      }
      await mutation.mutateAsync(data)
    } catch (err) {
      toast({ title: 'Falha no cadastro', description: 'Ocorreu um erro ao tentar cadastrar a sua imagem' });
    } finally {
      reset();
      closeModal();
    }
  };

  return (
    <Box as="form" width="100%" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={4}>
        <FileInput
          setImageUrl={setImageUrl}
          localImageUrl={localImageUrl}
          setLocalImageUrl={setLocalImageUrl}
          setError={setError}
          trigger={trigger}
          error={errors.image}
          {...register('image', formValidations.image)}
        />
        <TextInput placeholder="Título da imagem..." error={errors.title} {...register('title', formValidations.title)} />
        <TextInput placeholder="Descrição da imagem..." error={errors.description} {...register('description', formValidations.description)} />
        <Button isDisabled={formState.isSubmitting} isLoading={formState.isSubmitting} my={6} py={6} type="submit">Enviar</Button>
      </Stack>
    </Box>
  );
}
