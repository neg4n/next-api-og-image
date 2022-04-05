import type { GetStaticProps } from 'next'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { set } from 'lodash'
import { GoMarkGithub } from 'react-icons/go'
import {
  Code,
  Tooltip,
  IconButton,
  Button,
  Input,
  Icon,
  FormControl,
  FormLabel,
  Stack,
  Text,
  Flex,
  Heading,
  useBreakpointValue,
  LinkOverlay,
  LinkBox,
} from '@chakra-ui/react'
import { ArrowForwardIcon, ArrowDownIcon } from '@chakra-ui/icons'
import { readdir } from 'fs/promises'
import * as path from 'path'

import { Link, OptionSelect, ImagePreview } from 'components'
import { useOgImage, type RetrieveOgImageProps } from 'hooks'

type HomePageProps = {
  fullRoutesMetadata: Array<{
    legibleRouteName: string
    fileExtension: string
    routeProps: { type: 'body' | 'query'; props: Array<string> }
  }>
}

export default function HomePage({ fullRoutesMetadata }: HomePageProps) {
  const [ogImageData, setOgImageData] = useState<RetrieveOgImageProps>()
  const [selectedApiRoute, setSelectedApiRoute] = useState<string>(fullRoutesMetadata[0].legibleRouteName)
  const { retrieve } = useOgImage(selectedApiRoute)

  const {
    register,
    handleSubmit,
    formState: { isValidating },
  } = useForm()

  const activeRoute = fullRoutesMetadata.find(({ legibleRouteName }) => legibleRouteName === selectedApiRoute)
  const apiRouteParams = activeRoute?.routeProps.props
  const noPayload = apiRouteParams && apiRouteParams.length === 0
  //
  const isSubmitHorizontal = useBreakpointValue({ base: true, md: false })
  //

  const onSubmit = async (values) => {
  console.log({values})
    console.log({activeRoute})
    console.log({apiRouteParams})
    const outgoingStrategy = activeRoute.routeProps.type
    console.log(outgoingStrategy)
    const ogImageData = await retrieve(outgoingStrategy === 'query' ? 'get-query' : 'post-json', values)
    setOgImageData(ogImageData)
  }

  const handleApiRouteSelect = (option: string) => {
    setOgImageData(null)
    setSelectedApiRoute(option)
  }

  return (
    <Stack p={8} pt={{ base: 16, sm: 8 }} w="100%" h="100%" direction="column" spacing={4}>
      <Stack direction="column" spacing={4}>
        <Heading as={Stack} direction={{ base: 'column', md: 'row' }} justify="flex-start" align="center">
          <Code fontSize="2xl">next-api-og-image</Code>
          <Text as="span">interactive demo</Text>
        </Heading>
        <Text>
          Library that provides easy way to generate open-graph images dynamically in HTML or React using{' '}
          <Link href="https://nextjs.org/docs/api-routes/introduction">Next.js API Routes</Link> without
          creating new Vercel project. It is suitable for serverless environment. It is also very flexible -
          can be used along with <Link href="https://tailwindcss.com">TailwindCSS</Link>,{' '}
          <Link href="https://styled-components.com">styled-components</Link> and most likely many other
          styling solutions!
        </Text>
      </Stack>
      <Stack
        as="form"
        h="100%"
        w="100%"
        direction={{ base: 'column', md: 'row' }}
        spacing={4}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Flex w={{ base: '100%', md: '50%' }} flexDir="column">
          <OptionSelect
            variant="solid"
            size="lg"
            options={fullRoutesMetadata.map(({ legibleRouteName }) => legibleRouteName)}
            onOptionSelect={handleApiRouteSelect}
          />
          {!noPayload ? (
            <Stack mt={4} p={4} borderRadius="md" borderColor="gray.600" borderWidth="1px" borderStyle="solid">
              {apiRouteParams.map((queryParam) => (
                <FormControl key={queryParam} isRequired>
                  <FormLabel>{queryParam}</FormLabel>
                  <Input
                    placeholder={queryParam}
                    {...register(queryParam)}
                    {...(queryParam.includes('.')
                      ? { setValueAs: (value: string) => set({}, queryParam, value) }
                      : null)}
                  />
                </FormControl>
              ))}
            </Stack>
          ) : null}
        </Flex>
        <IconButton
          type="submit"
          w={{ base: '100%', md: '32px' }}
          minH={{ base: '42px', md: '100%' }}
          isLoading={isValidating}
          aria-label="Generate open-graph image"
          icon={
            isSubmitHorizontal ? (
              <Icon as={ArrowDownIcon} w={6} h={6} />
            ) : (
              <Icon as={ArrowForwardIcon} w={5} h={5} />
            )
          }
        />
        <Flex w={{ base: '100%', md: '50%' }}>
          <Stack
            w="100%"
            justify={{ base: 'flex-start', md: 'flex-start', lg: 'space-between' }}
            direction="column"
          >
            {ogImageData && ogImageData.type === 'image' ? (
              <ImagePreview src={ogImageData.content} />
            ) : ogImageData && ogImageData.type === 'html' ? (
              <Stack
                w="100%"
                borderRadius="md"
                borderColor="gray.600"
                borderWidth="1px"
                borderStyle="solid"
                p={4}
                flexDir="column"
              >
                <Text>This open-graph is generated in preview mode.</Text>
                <LinkBox>
                  <Button><LinkOverlay href={`https://github.com/neg4n/next-api-og-image/example/pages/api/${selectedApiRoute}`}>Click to see the preview in other tab</LinkOverlay></Button>
                </LinkBox>
              </Stack>
            ) : null}
            {ogImageData ? (
              <Stack
                p={4}
                borderStyle="solid"
                borderRadius="md"
                borderColor="gray.600"
                borderWidth="1px"
                direction="column"
                justify="center"
              >
                <Text>
                  Generated resource type:{' '}
                  <Text as="span" fontWeight="bold">
                    {ogImageData.type}
                  </Text>{' '}
                </Text>
                <Text>
                  Resource generation strategy:{' '}
                  <Text as="span">
                    {ogImageData.strategy === 'get-query' ? (
                      <>
                        <Text as="span" fontWeight="bold">
                          GET
                        </Text>{' '}
                        <Text as="span">and params passed by</Text>{' '}
                        <Text as="span" fontWeight="bold">
                          query
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text as="span" fontWeight="bold">
                          POST
                        </Text>{' '}
                        <Text as="span">and params passed by</Text>{' '}
                        <Text as="span" fontWeight="bold">
                          JSON
                        </Text>
                      </>
                    )}
                  </Text>{' '}
                </Text>
                <Stack direction={{ base: 'column', md: 'row' }}>
                  <Button w="100%">Open in other tab</Button>
                  <Tooltip label="Click to see source code responsible for generating this open-graph image.">
                    <Button w="100%" variant="outline" rightIcon={<Icon as={GoMarkGithub} w={5} h={5} />}>
                      View on GitHub
                    </Button>
                  </Tooltip>
                </Stack>
              </Stack>
            ) : null}
          </Stack>
        </Flex>
      </Stack>
    </Stack>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const routeFiles = await readdir(path.resolve('./pages/api'))
  const routeExtensions = routeFiles.map((route) => route.split('.')[1])
  const legibleRouteNames = routeFiles.map((route) => route.split('.')[0])

  const routeModules = await Promise.all(
    //  NOTE: https://webpack.js.org/api/module-methods/#dynamic-expressions-in-import
    legibleRouteNames.map((routeFile) => import(`../pages/api/${routeFile}`)),
  )

  const fullRoutesMetadata = legibleRouteNames.map((legibleRouteName, index) => ({
    legibleRouteName,
    fileExtension: routeExtensions[index], 
    routeProps: routeModules[index]._interactiveExampleProps ?? {},
  }))

  return {
    props: {
      fullRoutesMetadata,
    },
  }
}
