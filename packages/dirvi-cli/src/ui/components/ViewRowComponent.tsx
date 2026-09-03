import { Box, Text } from 'ink';
import { ViewRow } from '../view.js';

export function ViewRowComponent({ row }: { row: ViewRow }) {
  const prefix = row.cursor ? '>' : ' ';

  switch (row.type) {
    case 'file':
      return (
        <Box paddingLeft={row.indent * 2}>
          <Text inverse={row.selected}>
            {prefix}
            {row.content}
          </Text>
        </Box>
      );

    case 'directory':
      return (
        <Box paddingLeft={row.indent * 2}>
          <Text inverse={row.selected} color="blue">
            {prefix}
            {row.content}
          </Text>
        </Box>
      );

    case 'fold':
      return (
        <Box paddingLeft={row.indent * 2}>
          <Text inverse={row.selected} dimColor>
            {prefix}
            {row.content}
          </Text>
        </Box>
      );
  }
}
