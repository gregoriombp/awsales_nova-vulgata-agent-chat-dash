"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import MemoryBaseIcon from "@/components/MemoryBaseIcon";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

interface OrganizationOption {
  id: string;
  name: string;
  subtitle: string;
}

interface UserOption {
  id: string;
  name: string;
  title: string;
  initials: string;
  avatar?: string;
}

const ORGANIZATIONS: OrganizationOption[] = [
  { id: "org-1", name: "Nome da organização", subtitle: "Organização" },
  { id: "org-2", name: "AwSales Labs", subtitle: "Workspace" },
  { id: "org-3", name: "Cliente Demo", subtitle: "Organização" },
];

const USERS: UserOption[] = [
  { id: "user-1", name: "Gregório Pinheiro", title: "Super Administrador", initials: "GP", avatar: "/assets/users/greg.jpg" },
  { id: "user-2", name: "Gabriel Lima", title: "Administrador", initials: "GL", avatar: "/assets/users/gabriel_lima.jpg" },
  { id: "user-3", name: "José Júnior", title: "Estagiário", initials: "JJ", avatar: "/assets/users/jose.jpg" },
];

export default function Sidebar({ forcedCollapsed }: { forcedCollapsed?: boolean }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(() => pathname?.startsWith("/memory-base") ?? false);
  // Em todas as páginas (incluindo Memory Base): o usuário pode expandir/recolher a sidebar.
  const effectiveCollapsed = isCollapsed;
  // Botão de expandir/recolher visível em todas as páginas, inclusive dentro do Memory Base.
  const showExpandButton = true;

  const [isOrganizationMenuOpen, setIsOrganizationMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>(ORGANIZATIONS[0]?.id ?? "");
  const [selectedUserId, setSelectedUserId] = useState<string>(USERS[0]?.id ?? "");

  const selectedOrganization =
    ORGANIZATIONS.find((org) => org.id === selectedOrganizationId) ?? ORGANIZATIONS[0];
  const selectedUser = USERS.find((u) => u.id === selectedUserId) ?? USERS[0];

  const organizationMenuRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      if (isOrganizationMenuOpen && organizationMenuRef.current && !organizationMenuRef.current.contains(target)) {
        setIsOrganizationMenuOpen(false);
      }
      if (isUserMenuOpen && userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOrganizationMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOrganizationMenuOpen, isUserMenuOpen]);

  useEffect(() => {
    if (pathname?.startsWith("/memory-base")) setIsCollapsed(true);
  }, [pathname]);

  const navSections: NavSection[] = [
    {
      items: [
        {
          label: "Início",
          href: "/inicio",
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.125 15.625V8.125L10 3.125L16.875 8.125V15.625H12.5V11.25H7.5V15.625H3.125Z" fill="currentColor"/>
            </svg>
          ),
        },
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3.125" y="3.125" width="5.625" height="5.625" fill="currentColor"/>
              <rect x="11.25" y="3.125" width="5.625" height="5.625" fill="currentColor"/>
              <rect x="3.125" y="11.25" width="5.625" height="5.625" fill="currentColor"/>
              <rect x="11.25" y="11.25" width="5.625" height="5.625" fill="currentColor"/>
            </svg>
          ),
        },
        {
          label: "Insights",
          href: "/insights",
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.875 3.125L18.75 1.875L16.875 18.75L14.375 16.25L11.875 18.75L10 13.75L5 11.875L7.5 9.375L5 6.875L1.875 3.125Z" fill="currentColor"/>
            </svg>
          ),
        },
      ],
    },
    {
      title: "Agentes",
      items: [
        {
          label: "Agent Studio",
          href: "/agent-studio",
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.75 15.625C3.75 16.3125 4.0625 16.5625 4.6875 16.875L10 18.75L15.3125 16.875C15.9375 16.5625 16.25 16.3125 16.25 15.625V7.1875C16.25 6.5 15.9375 6.25 15.3125 5.9375L10 4.0625L4.6875 5.9375C4.0625 6.25 3.75 6.5 3.75 7.1875V15.625Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M10 4.0625V18.75" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M16.25 7.1875L10 10L3.75 7.1875" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          ),
        },
        {
          label: "Aprovações",
          href: "/approvals",
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.75 10L7.5 13.75L16.25 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3.75 12.5L7.5 16.25L16.25 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
            </svg>
          ),
        },
        {
          label: "Disparos",
          href: "/triggers",
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.875 1.875L17.5 10L1.875 18.125L3.125 10L1.875 1.875Z" fill="currentColor"/>
            </svg>
          ),
        },
      ],
    },
    {
      title: "Fontes",
      items: [
        {
          label: "Memory Base",
          href: "/memory-base",
          icon: <MemoryBaseIcon className="flex-shrink-0" />,
        },
        {
          label: "AOPs",
          href: "/aops",
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.125 1.875H16.875V15.625H3.125V1.875Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M6.25 5H13.75M6.25 8.125H13.75M6.25 11.25H13.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          ),
        },
        {
          label: "Biblioteca",
          href: "/library",
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.375 2.5L10 5L15.625 2.5V16.25L10 18.75L4.375 16.25V2.5Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          ),
        },
        {
          label: "Tools",
          href: "/tools",
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.625 1.875L11.875 5.625L8.125 1.875M8.125 1.875L4.375 5.625L1.875 3.125V18.125H18.125V3.125L15.625 5.625" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          ),
        },
        {
          label: "Integrações",
          href: "/integrations",
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.5 5C7.5 4.375 7.8125 3.75 8.4375 3.4375L9.375 3.125C9.75 2.96875 10.25 2.96875 10.625 3.125L11.5625 3.4375C12.1875 3.75 12.5 4.375 12.5 5V6.5625C12.5 7.1875 12.1875 7.8125 11.5625 8.125L10.625 8.4375C10.25 8.59375 9.75 8.59375 9.375 8.4375L8.4375 8.125C7.8125 7.8125 7.5 7.1875 7.5 6.5625V5Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M3.75 12.5C3.75 11.875 4.0625 11.25 4.6875 10.9375L5.625 10.625C6 10.4688 6.5 10.4688 6.875 10.625L7.8125 10.9375C8.4375 11.25 8.75 11.875 8.75 12.5V14.0625C8.75 14.6875 8.4375 15.3125 7.8125 15.625L6.875 15.9375C6.5 16.0938 6 16.0938 5.625 15.9375L4.6875 15.625C4.0625 15.3125 3.75 14.6875 3.75 14.0625V12.5Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M11.25 12.5C11.25 11.875 11.5625 11.25 12.1875 10.9375L13.125 10.625C13.5 10.4688 14 10.4688 14.375 10.625L15.3125 10.9375C15.9375 11.25 16.25 11.875 16.25 12.5V14.0625C16.25 14.6875 15.9375 15.3125 15.3125 15.625L14.375 15.9375C14 16.0938 13.5 16.0938 13.125 15.9375L12.1875 15.625C11.5625 15.3125 11.25 14.6875 11.25 14.0625V12.5Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          ),
        },
      ],
    },
    {
      title: "Acompanhamento",
      items: [
        {
          label: "Conversas",
          href: "/conversations",
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.25 3.75C17.1875 3.75 17.9375 4.5 17.9375 5.4375V11.5625C17.9375 12.5 17.1875 13.25 16.25 13.25H11.875L8.125 16.25V13.25H3.75C2.8125 13.25 2.0625 12.5 2.0625 11.5625V5.4375C2.0625 4.5 2.8125 3.75 3.75 3.75H16.25Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
          ),
          badge: "99+",
        },
        {
          label: "Playground",
          href: "/playground",
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8.125" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M5.625 7.5C5.625 7.5 7.5 9.375 10 9.375C12.5 9.375 14.375 7.5 14.375 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M5.625 12.5C5.625 12.5 7.5 10.625 10 10.625C12.5 10.625 14.375 12.5 14.375 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          ),
        },
        {
          label: "Histórico de alterações",
          href: "/history",
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 18.125C14.1421 18.125 17.5 14.7671 17.5 10.625C17.5 6.48286 14.1421 3.125 10 3.125C5.85786 3.125 2.5 6.48286 2.5 10.625" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10 6.25V10.625L13.125 13.125" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M1.875 8.125L2.5 10.625L5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
        },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside className={`${effectiveCollapsed ? 'w-[80px]' : 'w-[280px]'} bg-[#0d0d0d] border-r border-[#161a20] h-screen flex flex-col transition-all duration-300 flex-shrink-0`}>
      {/* Header - Logo and Toggle */}
      <div className={`border-b border-[#1a1a1a] flex items-center ${effectiveCollapsed ? 'justify-center px-3' : 'justify-between px-6'} h-[56px]`}>
        {!effectiveCollapsed && (
          <div className="flex items-center">
            <span className="text-white text-[22.667px] font-bold tracking-[-0.4427px] leading-[34px]">Aw</span>
            <span className="text-[#999] text-[22.667px] font-bold tracking-[-0.4427px] leading-[34px]">Sales</span>
          </div>
        )}
        {showExpandButton && (
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-[#999] hover:text-white transition-colors p-2 rounded-lg hover:bg-[#1a1a1a]"
            aria-label={effectiveCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.75 3.75H15.625M3.75 7.1875H15.625M3.75 11.875H15.625" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Organization Selector */}
      <div className="px-3 pt-[31px] pb-4">
        <div ref={organizationMenuRef} className="relative">
          <button
            onClick={() => {
              setIsOrganizationMenuOpen((v) => !v);
              setIsUserMenuOpen(false);
            }}
            className={`w-full bg-[#2f2f2f] border border-[#2f2f2f] rounded-[10px] flex items-center gap-4 h-[50px] transition-colors hover:bg-[#383838] ${effectiveCollapsed ? 'justify-center px-2' : 'px-[9px]'}`}
            aria-haspopup="menu"
            aria-expanded={isOrganizationMenuOpen}
          >
            <div className="w-8 h-8 rounded-[5.25px] flex items-center justify-center flex-shrink-0 overflow-hidden bg-white">
              <img
                src="/assets/icon_artificial_concord_organization.png"
                alt=""
                className="w-full h-full object-contain"
              />
            </div>
            {!effectiveCollapsed && (
              <>
                <div className="flex-1 text-left">
                  <div className="text-[#f9f9f9] text-[12px] font-medium leading-tight font-['Instrument_Sans']">
                    {selectedOrganization?.name ?? "Organização"}
                  </div>
                  <div className="text-[#b8b8b8] text-[10px] font-normal leading-tight font-['Instrument_Sans']">
                    {selectedOrganization?.subtitle ?? "Organização"}
                  </div>
                </div>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="#f9f9f9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>

          {isOrganizationMenuOpen && (
            <div
              role="menu"
              className={`absolute z-50 ${
                effectiveCollapsed
                  ? "left-full top-0 ml-2 w-64"
                  : "left-0 right-0 top-full mt-2"
              } rounded-[10px] border border-[#161a20] bg-[#1f1f1f] shadow-xl overflow-hidden`}
            >
              <div className="p-1">
                {ORGANIZATIONS.map((org) => {
                  const active = org.id === selectedOrganizationId;
                  return (
                    <button
                      key={org.id}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setSelectedOrganizationId(org.id);
                        setIsOrganizationMenuOpen(false);
                      }}
                      className={`w-full rounded-[8px] px-3 py-2 text-left transition-colors ${
                        active ? "bg-white text-[#0c1421]" : "text-[#f0f3f7] hover:bg-[#1a1a1a]"
                      }`}
                    >
                      <div className="text-[13px] font-medium leading-tight font-['Instrument_Sans']">{org.name}</div>
                      <div className={`${active ? "text-[#0c1421]/70" : "text-[#b8b8b8]"} text-[11px] leading-tight font-['Instrument_Sans']`}>
                        {org.subtitle}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-[#161a20] p-1">
                <Link
                  href="/settings"
                  role="menuitem"
                  onClick={() => setIsOrganizationMenuOpen(false)}
                  className="block rounded-[8px] px-3 py-2 text-[#999] hover:bg-[#1a1a1a] hover:text-white transition-colors text-[13px] font-medium font-['Instrument_Sans']"
                >
                  Gerenciar organizações
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
        {navSections.map((section, sectionIdx) => (
          <div key={sectionIdx} className={sectionIdx > 0 ? 'mt-[37px]' : ''}>
            {section.title && !effectiveCollapsed && (
              <div className="px-3 mb-[3px] h-[21px] flex items-center">
                <span className="text-[#5e5e5e] text-[12px] font-semibold uppercase tracking-wider font-['Inter']">
                  {section.title}
                </span>
              </div>
            )}
            <div className="space-y-[2px]">
              {section.items.map((item) => {
                const isMemoryBaseItem = section.title === "Fontes" && item.label === "Memory Base";
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={isMemoryBaseItem ? () => setIsCollapsed(true) : undefined}
                    className={`flex items-center h-10 rounded-[8px] transition-all ${
                      effectiveCollapsed ? 'justify-center px-2' : 'gap-3 px-3'
                    } ${
                      active
                        ? "bg-white text-[#0c1421]"
                        : "text-[#999] hover:bg-[#1a1a1a] hover:text-white"
                    }`}
                    title={effectiveCollapsed ? item.label : undefined}
                  >
                    <span className={`flex-shrink-0 ${active ? "text-[#0c1421]" : ""}`}>{item.icon}</span>
                    {!effectiveCollapsed && (
                      <>
                        <span className="flex-1 text-[16px] font-medium leading-normal font-['Instrument_Sans']">{item.label}</span>
                        {item.badge && (
                          <span className="bg-[#1a1a1a] text-[#f9f9f9] text-[10px] font-normal px-1 py-0.5 rounded-[4px] leading-normal font-['Instrument_Sans']">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="border-t border-[#161a20] px-3 py-3 space-y-3">
        {/* Configurações */}
        <Link
          href="/settings"
          className={`flex items-center h-10 rounded-[8px] transition-all ${
            effectiveCollapsed ? 'justify-center px-2' : 'gap-3 px-3'
          } ${
            pathname === '/settings'
              ? "bg-white text-[#0c1421]"
              : "text-[#999] hover:bg-[#1a1a1a] hover:text-white"
          }`}
          title={effectiveCollapsed ? "Configurações" : undefined}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 3.125C10.6875 3.125 11.375 3.4375 11.875 3.9375L12.5 4.5625C12.8125 4.875 13.1875 5 13.625 5H14.0625C15.3125 5 16.25 5.9375 16.25 7.1875V7.625C16.25 8.0625 16.375 8.4375 16.6875 8.75L17.3125 9.375C18.3125 10.375 18.3125 11.9375 17.3125 12.9375L16.6875 13.5625C16.375 13.875 16.25 14.25 16.25 14.6875V15.125C16.25 16.375 15.3125 17.3125 14.0625 17.3125H13.625C13.1875 17.3125 12.8125 17.4375 12.5 17.75L11.875 18.375C10.875 19.375 9.3125 19.375 8.3125 18.375L7.6875 17.75C7.375 17.4375 7 17.3125 6.5625 17.3125H6.125C4.875 17.3125 3.9375 16.375 3.9375 15.125V14.6875C3.9375 14.25 3.8125 13.875 3.5 13.5625L2.875 12.9375C1.875 11.9375 1.875 10.375 2.875 9.375L3.5 8.75C3.8125 8.4375 3.9375 8.0625 3.9375 7.625V7.1875C3.9375 5.9375 4.875 5 6.125 5H6.5625C7 5 7.375 4.875 7.6875 4.5625L8.3125 3.9375C8.8125 3.4375 9.5 3.125 10 3.125Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <circle cx="10" cy="11.25" r="2.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
          {!effectiveCollapsed && <span className="text-[16px] font-medium leading-normal font-['Instrument_Sans']">Configurações</span>}
        </Link>

        {/* User Profile */}
        <div ref={userMenuRef} className="relative">
          <button
            onClick={() => {
              setIsUserMenuOpen((v) => !v);
              setIsOrganizationMenuOpen(false);
            }}
            className={`w-full bg-[#0d0d0d] border border-[#161a20] rounded-[10px] flex items-center transition-colors hover:bg-[#1a1a1a] ${effectiveCollapsed ? 'justify-center p-2' : 'gap-4 px-2 py-2'}`}
            aria-haspopup="menu"
            aria-expanded={isUserMenuOpen}
          >
            <div className="relative w-[34px] h-[34px] rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#4a5568] to-[#2d3748] flex items-center justify-center">
              {selectedUser?.avatar ? (
                <img src={selectedUser.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-sm font-medium">{selectedUser?.initials ?? "U"}</span>
              )}
            </div>
            {!effectiveCollapsed && (
              <>
                <div className="flex-1 text-left">
                  <div className="text-[#f0f3f7] text-[14px] font-medium leading-tight font-['Instrument_Sans']">
                    {selectedUser?.name ?? "Usuário"}
                  </div>
                  <div className="text-[#b8b8b8] text-[12px] font-normal leading-tight font-['Instrument_Sans']">
                    {selectedUser?.title ?? "Conta"}
                  </div>
                </div>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>

          {isUserMenuOpen && (
            <div
              role="menu"
              className={`absolute z-50 ${
                effectiveCollapsed
                  ? "left-full bottom-0 ml-2 w-64"
                  : "left-0 right-0 bottom-full mb-2"
              } rounded-[10px] border border-[#161a20] bg-[#1f1f1f] shadow-xl overflow-hidden`}
            >
              <div className="p-1">
                {USERS.map((u) => {
                  const active = u.id === selectedUserId;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setSelectedUserId(u.id);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full rounded-[8px] px-3 py-2 text-left transition-colors ${
                        active ? "bg-white text-[#0c1421]" : "text-[#f0f3f7] hover:bg-[#1a1a1a]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-[12px] font-semibold flex-shrink-0 ${
                          active ? "bg-[#0c1421] text-white" : "bg-[#1a1a1a] text-white"
                        }`}>
                          {u.avatar ? (
                            <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            u.initials
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-[13px] font-medium leading-tight font-['Instrument_Sans']">{u.name}</div>
                          <div className={`${active ? "text-[#0c1421]/70" : "text-[#b8b8b8]"} text-[11px] leading-tight font-['Instrument_Sans']`}>
                            {u.title}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-[#161a20] p-1">
                <Link
                  href="/"
                  role="menuitem"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="block rounded-[8px] px-3 py-2 text-[#ffb4b4] hover:bg-[#1a1a1a] transition-colors text-[13px] font-medium font-['Instrument_Sans']"
                >
                  Sair / trocar conta
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
