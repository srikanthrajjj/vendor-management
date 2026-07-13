import svgPaths from "./svg-08cbebgb2s";
import imgImage1 from "./982681868f53b4e9464c3a6bfb61000d087b71f9.png";

function Text() {
  return (
    <div className="relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Inter:Light',sans-serif] font-light leading-[20px] not-italic relative shrink-0 text-[#ddd] text-[14px] whitespace-nowrap">|</p>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[16px] not-italic relative shrink-0 text-[12px] text-black whitespace-nowrap">Vendor Portal</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0" data-name="Container">
      <Text />
      <Text1 />
    </div>
  );
}

function Frame() {
  return (
    <div className="relative shrink-0 w-[550.2px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[24px] items-center relative size-full">
        <div className="h-[46px] relative shrink-0 w-[89px]" data-name="image 1">
          <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage1} />
        </div>
        <Container1 />
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="relative shrink-0 size-[16px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        <g id="Icon">
          <path d={svgPaths.p1ce3c700} id="Vector" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          <path d={svgPaths.p1a06de00} id="Vector_2" stroke="var(--stroke-0, #666666)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
        </g>
      </svg>
    </div>
  );
}

function Text2() {
  return <div className="absolute bg-[#fb2c36] left-[18px] rounded-[26843500px] size-[6px] top-[4px]" data-name="Text" />;
}

function Button() {
  return (
    <div className="relative rounded-[10px] shrink-0" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start justify-center p-[6px] relative size-full">
        <Icon />
        <Text2 />
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="bg-[#1a3055] relative rounded-[26843500px] shrink-0 size-[24px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <p className="[word-break:break-word] font-['Inter:Bold',sans-serif] font-bold leading-[15px] not-italic relative shrink-0 text-[10px] text-white whitespace-nowrap">SH</p>
      </div>
    </div>
  );
}

function Text3() {
  return (
    <div className="relative shrink-0" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <p className="[word-break:break-word] font-['Inter:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[#444] text-[12px] whitespace-nowrap">EV-137 Sage Lane</p>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="relative shrink-0 size-[12px]" data-name="Icon">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g id="Icon">
          <path d="M3 4.5L6 7.5L9 4.5" id="Vector" stroke="var(--stroke-0, #999999)" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

function Container3() {
  return (
    <div className="relative rounded-[12px] shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center px-[8px] py-[4px] relative size-full">
        <Container4 />
        <Text3 />
        <Icon1 />
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[12px] items-center relative size-full">
        <Button />
        <Container3 />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="bg-[#00aeef] h-[47.2px] relative shrink-0 w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between pl-[7px] pr-[20px] relative size-full">
        <Frame />
        <Container2 />
      </div>
    </div>
  );
}

export default function Header() {
  return (
    <div className="bg-white content-stretch drop-shadow-[0px_1px_2px_rgba(0,0,0,0.06)] flex flex-col items-start pb-[0.8px] relative size-full" data-name="Header">
      <div aria-hidden className="absolute border-[rgba(0,0,0,0.08)] border-b-[0.8px] border-solid inset-0 pointer-events-none" />
      <Container />
    </div>
  );
}