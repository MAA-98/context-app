import { Text } from 'ink';
import { UnixEntry } from 'dirvi-lib';

export function UnixEntry({
  entry,
  selected,
}: {
  entry: UnixEntry;
  selected: boolean;
}) {
  switch (entry.kind) {
    case 'file':
      return <Text inverse={selected}>{entry.name}</Text>;

    case 'symlink':
      return (
        <Text inverse={selected}>
          {entry.name} -&gt; {entry.target}
        </Text>
      );

    case 'directory':
      return (
        <Text inverse={selected} color="blue">
          {entry.name}/
        </Text>
      );
  }
}
