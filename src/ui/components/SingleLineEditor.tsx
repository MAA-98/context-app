import { Box, Text, useApp, useInput } from 'ink';

type Props = {
  flexGrow?: number;
  label?: string,
  hint?: string;
  prompt?: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => void;
  onBack?: () => void;
  active?: boolean;
};

export function SingleLineEditor({ flexGrow=0, label, hint, prompt='> ', value, setValue, onSubmit, onBack, active = true }: Props) {
  const { exit } = useApp();
  
  useInput((input, key) => {
    if (!active) return;
    
    switch (true) {
      case key.return:
        onSubmit();
        break;
      
      case key.escape:
        if (onBack) {
          onBack();
        } else {
          exit();
        }
        break;
      
      case key.backspace:
        setValue(value.slice(0, -1));
        break;
      
      case !key.ctrl && Boolean(input):
        setValue(value + input);
        break;
    }
  });
  
  return (
    <Box flexDirection="column" flexGrow={flexGrow}>
      
      {(label || hint) && (
        <Box flexDirection="row" justifyContent="space-between">
          <Text bold>{label}</Text>
          {hint && <Text dimColor>{hint}</Text>}
        </Box>
      )}
      
      <Box>
        <Text>
          <Text color="cyan">{prompt}</Text>
          {value}
          {active ? <Text inverse> </Text> : null}
        </Text>
      </Box>
    </Box>
  );
}