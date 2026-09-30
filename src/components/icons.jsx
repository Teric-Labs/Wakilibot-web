import {
  MessageSquareText,
  ScrollText,
  LibraryBig,
  LifeBuoy,
  SlidersHorizontal,
  UserRound,
  SquarePen,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowDown,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  ArrowLeftRight,
  MoreVertical,
  LogIn,
  LogOut,
  Download,
  FileText,
  ShieldAlert,
  SearchCheck,
  Scale,
  CircleHelp,
  Sparkles,
  Play,
  Pause,
  Mic,
  Square,
  Send,
  X,
  PenLine,
  Check,
  ChevronDown,
  Search,
  Eye,
  EyeOff,
  Phone,
  Mail,
  RotateCw,
  Inbox,
  FileSearch,
  ExternalLink,
  Link,
  Trash2,
} from 'lucide-react';

/**
 * The workspace's one icon language.
 *
 * Everything the product itself shows - the sidebar rail, the topic menu, the composer, the
 * recording panel, the panels behind them and the sign-in forms - draws from this file, at one
 * stroke weight and on the same 24px grid. Mixing a filled Material glyph with a Lucide line in
 * the same column is what made the old sidebar look assembled from two products, so components
 * import from here instead of reaching for `@mui/icons-material`. The marketing pages
 * (LandingPage, TopNav, AboutUs, HowItWorks) keep their own set on purpose; they are a different
 * surface and never appear beside these icons.
 *
 * Lucide icons inherit colour from `currentColor` like a Material icon does, so they pick up
 * the same navy/muted/gold tokens from the surrounding sx. The only difference is sizing:
 * pass `size={20}` rather than `sx={{ fontSize: 20 }}`.
 */
const STROKE_WIDTH = 1.65;

const makeIcon = (Glyph, defaultSize = 18) => {
  const Icon = ({ size, strokeWidth = STROKE_WIDTH, ...rest }) => (
    <Glyph size={size ?? defaultSize} strokeWidth={strokeWidth} aria-hidden="true" {...rest} />
  );
  Icon.displayName = `WorkspaceIcon(${Glyph.displayName || Glyph.name || 'lucide'})`;
  return Icon;
};

// Sidebar rail
export const AskWakiliIcon = makeIcon(MessageSquareText);
export const HistoryIcon = makeIcon(ScrollText);
export const DocumentsIcon = makeIcon(LibraryBig);
export const SupportIcon = makeIcon(LifeBuoy);
export const SettingsIcon = makeIcon(SlidersHorizontal);
export const AccountIcon = makeIcon(UserRound);
export const NewEnquiryIcon = makeIcon(SquarePen);
export const CollapseRailIcon = makeIcon(PanelLeftClose);
export const ExpandRailIcon = makeIcon(PanelLeftOpen);

// Chat surface
export const ScrollToLatestIcon = makeIcon(ArrowDown, 20);
export const OptionsIcon = makeIcon(MoreVertical, 20);
export const SignInIcon = makeIcon(LogIn, 20);
export const SignOutIcon = makeIcon(LogOut, 20);
export const ExportIcon = makeIcon(Download, 20);
export const TopicArrowIcon = makeIcon(ArrowUpRight, 16);
export const ChangeTopicIcon = makeIcon(ArrowLeftRight, 16);
export const PlayReplyIcon = makeIcon(Play, 15);
export const PauseIcon = makeIcon(Pause, 15);
export const SpokenIcon = makeIcon(Mic, 13);
export const MicIcon = makeIcon(Mic, 20);
export const StopIcon = makeIcon(Square, 15);
export const SendIcon = makeIcon(Send, 18);
export const CloseIcon = makeIcon(X, 18);
export const EditTranscriptIcon = makeIcon(PenLine, 15);
export const TrashIcon = makeIcon(Trash2, 18);
export const FlowArrowIcon = makeIcon(ArrowRight, 14);
export const BackIcon = makeIcon(ArrowLeft, 20);
export const SelectedIcon = makeIcon(Check, 18);
export const ExpandSectionIcon = makeIcon(ChevronDown, 20);
export const SearchFieldIcon = makeIcon(Search, 20);
export const DocumentIcon = makeIcon(FileText, 20);
export const ConversationIcon = makeIcon(MessageSquareText, 20);
export const BrandMarkIcon = makeIcon(Scale, 18);

// Auth forms: signed out or in, it is still the same product, so it gets the same glyphs.
export const ShowPasswordIcon = makeIcon(Eye, 20);
export const HidePasswordIcon = makeIcon(EyeOff, 20);

// Panel cards in History / Documents / Help (see PanelCard.jsx)
export const ComplaintTopicIcon = makeIcon(FileText, 19);
export const FraudTopicIcon = makeIcon(ShieldAlert, 19);
export const PhoneIcon = makeIcon(Phone, 15);
export const EmailIcon = makeIcon(Mail, 15);
export const RefreshIcon = makeIcon(RotateCw, 16);
export const EmptyConversationsIcon = makeIcon(Inbox, 19);
export const EmptyDocumentsIcon = makeIcon(FileSearch, 19);

// The three-dot menu on the right edge of a panel card, and the actions inside it.
export const CardMenuIcon = makeIcon(MoreVertical, 18);
export const ViewActionIcon = makeIcon(ExternalLink, 16);
export const DownloadActionIcon = makeIcon(Download, 16);
export const CopyLinkActionIcon = makeIcon(Link, 16);
export const OpenActionIcon = makeIcon(MessageSquareText, 16);

/**
 * Topic glyphs, keyed by the `icon` name the agent publishes at GET /intents. Both the Lucide
 * name and the Material name it replaced are accepted, so a frontend build and an agent build
 * that are a deployment apart still agree on what each topic looks like.
 */
export const TOPIC_GLYPHS = {
  'file-text': FileText,
  description: FileText,
  'shield-alert': ShieldAlert,
  gpp_bad: ShieldAlert,
  'search-check': SearchCheck,
  fact_check: SearchCheck,
  scale: Scale,
  balance: Scale,
  'circle-help': CircleHelp,
  help_outline: CircleHelp,
  sparkles: Sparkles,
  auto_awesome: Sparkles,
};

export const topicGlyph = (name) => TOPIC_GLYPHS[name] || CircleHelp;
