import { Select } from '@chakra-ui/select'
import { useState } from 'react'

type OptionSelectProps = {
  options: Array<string>
  onOptionSelect: (option: string) => void
  [rest: string]: any
}

export function OptionSelect({ options, onOptionSelect, ...rest }: OptionSelectProps) {
  return (
    <Select {...rest} onChange={({ target: { value } }) => onOptionSelect(value)}>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </Select>
  )
}
