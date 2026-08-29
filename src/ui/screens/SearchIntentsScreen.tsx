import React, { useEffect, useMemo, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { Intent } from '../../domain/types.js';
import { SearchIntents } from '../../application/search-intents.js';
import { SingleLineEditor } from '../components/SingleLineEditor.js';
import { SearchIntentResultItem } from '../components/SearchIntentResultItem.js';

type Props = {
  intents: Intent[];
  initialQuery?: string;
  onSubmit: (intent: Intent) => void;
  onEdit: (intent: Intent) => void;
  onExit: (message?: string) => void;
};

export function SearchIntentsScreen({
  intents,
  initialQuery = '',
  onSubmit,
  onEdit,
  onExit,
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [activeIndex, setActiveIndex] = useState(0);

  const matches = useMemo(
    () => SearchIntents(query, intents),
    [query, intents],
  );

  useEffect(() => {
    setActiveIndex((i) =>
      Math.max(0, Math.min(i, Math.max(0, matches.length - 1))),
    );
  }, [matches.length]);

  // Leave search input to SingleLineEditor
  useInput((input, key) => {
    if (key.upArrow) {
      setActiveIndex((i) => Math.max(0, i - 1));
      return;
    }

    if (key.downArrow) {
      setActiveIndex((i) => Math.min(matches.length - 1, i + 1));
      return;
    }
    
    if (key.ctrl && input === 'e') {
      if (selected) onEdit(selected);
      return;
    }
  });

  const selected = matches[activeIndex];

  return (
    <Box flexDirection="column">
      <Box flexDirection="row" justifyContent="space-between">
        <Text bold>Search intents</Text>
        <Text dimColor>
          {selected
            ? '↑/↓:Navigate | Enter:Run | Ctrl+E:Edit | Esc:Exit'
            : 'Esc:Exit'}
        </Text>
      </Box>

      <Box borderStyle="round" paddingX={1} paddingY={0}>
        <SingleLineEditor
          prompt="Search: "
          value={query}
          setValue={setQuery}
          onSubmit={() => {
            const selected = matches[activeIndex];
            if (selected) onSubmit(selected);
          }}
          onBack={onExit}
          active={true}
        />
      </Box>

      <Box flexDirection="column">
        {matches.length === 0 ? (
          <Box borderStyle="round" paddingX={1} paddingY={0}>
            <Text dimColor>No matches for “{query}”</Text>
          </Box>
        ) : (
          matches.map((intent, index) => (
            <SearchIntentResultItem
              key={intent.id}
              intent={intent}
              isSelected={index === activeIndex}
            />
          ))
        )}
      </Box>
    </Box>
  );
}
