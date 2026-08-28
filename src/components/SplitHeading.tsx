import React from 'react';

interface SplitHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  text: string;
  highlight?: string[];
  emClass?: string;
}

const stripPunct = (w: string) => w.replace(/[^a-zA-Z0-9₹.,?']/g, '');

const SplitHeading: React.FC<SplitHeadingProps> = ({
  as: Tag = 'h2',
  text,
  highlight = [],
  emClass = 'text-[#B8860B]',
  className = '',
  style,
}) => (
  <Tag className={className} style={style}>
    {text.split('\n').map((line, li) => {
      const words = line.split(' ');
      return (
        <span key={li} className={li > 0 ? 'block' : undefined}>
          {words.map((word, wi) => {
            const key = stripPunct(word);
            const isEm = highlight.includes(key);
            const chars = word.split('').map((ch, ci) => (
              <span key={ci} className="sc">
                {ch}
              </span>
            ));
            return (
              <span key={wi} className="sw">
                {isEm ? <em className={`not-italic ${emClass}`}>{chars}</em> : chars}
                {wi < words.length - 1 ? ' ' : ''}
              </span>
            );
          })}
        </span>
      );
    })}
  </Tag>
);

export default SplitHeading;