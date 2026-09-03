import { Box, Text } from 'ink';

export const STATUS_BAR_HEIGHT = 1;

type StatusBarProps = {
  commandBuffer: string;
};

export function StatusBar({ commandBuffer }: StatusBarProps) {
  return (
    <Box
      width="100%"
      height={STATUS_BAR_HEIGHT}
      flexDirection="row"
      justifyContent="flex-end"
      flexShrink={0}
      backgroundColor={'gray'}
    >
      <Text color="black" wrap="truncate-start">
        {commandBuffer}
      </Text>
    </Box>
  );
}
