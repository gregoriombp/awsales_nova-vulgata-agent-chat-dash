"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

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
  const [isCollapsed, setIsCollapsed] = useState(() => pathname?.startsWith("/knowledge-os") ?? false);
  // Em todas as páginas (incluindo Knowledge OS): o usuário pode expandir/recolher a sidebar.
  const effectiveCollapsed = isCollapsed;
  // Botão de expandir/recolher visível em todas as páginas, inclusive dentro do Knowledge OS.
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
    if (pathname?.startsWith("/knowledge-os")) setIsCollapsed(true);
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
              <rect x="3" y="3" width="6" height="14" rx="1" fill="currentColor"/>
              <rect x="11" y="3" width="6" height="6" rx="1" fill="currentColor"/>
              <rect x="11" y="11" width="6" height="6" rx="1" fill="currentColor"/>
            </svg>
          ),
        },
        {
          label: "Insights",
          href: "/insights",
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.25 2.5L5.417 11.25h4.166L8.75 17.5l5.833-8.75h-4.166L11.25 2.5Z" fill="currentColor"/>
            </svg>
          ),
        },
      ],
    },
    {
      title: "Agentes",
      items: [
        {
          label: "Agent studio",
          href: "/agent-studio",
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="10" y1="1" x2="10" y2="6"/>
                <line x1="14.5" y1="2.2" x2="12" y2="6.5"/>
                <line x1="17.8" y1="5.5" x2="13.5" y2="8"/>
                <line x1="19" y1="10" x2="14" y2="10"/>
                <line x1="17.8" y1="14.5" x2="13.5" y2="12"/>
                <line x1="14.5" y1="17.8" x2="12" y2="13.5"/>
                <line x1="10" y1="19" x2="10" y2="14"/>
                <line x1="5.5" y1="17.8" x2="8" y2="13.5"/>
                <line x1="2.2" y1="14.5" x2="6.5" y2="12"/>
                <line x1="1" y1="10" x2="6" y2="10"/>
                <line x1="2.2" y1="5.5" x2="6.5" y2="8"/>
                <line x1="5.5" y1="2.2" x2="8" y2="6.5"/>
              </g>
            </svg>
          ),
        },
        {
          label: "Aprovações",
          href: "/approvals",
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.667 10.833L5.417 14.583L12.083 7.917" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7.917 10.833L10 12.917L18.333 4.583" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ),
        },
        {
          label: "Disparos",
          href: "/triggers",
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3.333 16.667V11.667L10 10 3.333 8.333V3.333L17.5 10 3.333 16.667Z" fill="currentColor"/>
            </svg>
          ),
        },
      ],
    },
    {
      title: "Fontes",
      items: [
        {
          label: "Memory base",
          href: "/knowledge-os",
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="2.5" fill="currentColor"/>
              <circle cx="5" cy="7.5" r="1.75" fill="currentColor"/>
              <circle cx="15" cy="7.5" r="1.75" fill="currentColor"/>
              <circle cx="5" cy="13" r="1.5" fill="currentColor"/>
              <circle cx="15" cy="13" r="1.5" fill="currentColor"/>
              <circle cx="10" cy="4" r="1.25" fill="currentColor"/>
              <circle cx="10" cy="16" r="1.25" fill="currentColor"/>
              <circle cx="3" cy="10" r="1" fill="currentColor"/>
              <circle cx="17" cy="10" r="1" fill="currentColor"/>
            </svg>
          ),
        },
        {
          label: "AOPs",
          href: "/aops",
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3.333" y="3.333" width="13.333" height="13.333" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M6.667 7.5H13.333M6.667 10H13.333M6.667 12.5H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          ),
        },
        {
          label: "Biblioteca",
          href: "/library",
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.833 16.667V4.167c0-.459.163-.851.488-1.179.326-.325.721-.488 1.179-.488h5c.459 0 .854.163 1.179.488.325.328.488.72.488 1.179v12.5L10 14.167l-4.167 2.5Z" fill="currentColor"/>
            </svg>
          ),
        },
        {
          label: "Tools",
          href: "/tools",
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.208 16.042a.75.75 0 01-.55-.225.75.75 0 01-.225-.55c0-.209.075-.392.225-.542l5.209-5.208A3.627 3.627 0 019.167 7.5c0-1.042.368-1.932 1.104-2.667.736-.736 1.625-1.104 2.667-1.104.354 0 .694.049 1.02.146.327.097.633.229.917.396l-2.458 2.458 1.854 1.854 2.458-2.458c.167.284.299.59.396.917.098.326.146.666.146 1.02 0 1.042-.368 1.932-1.104 2.667-.736.736-1.625 1.104-2.667 1.104-.625 0-1.198-.139-1.72-.417l-5.222 5.209a.738.738 0 01-.55.217Z" fill="currentColor"/>
            </svg>
          ),
        },
        {
          label: "Integrações",
          href: "/integrations",
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.208 9.375L9.792 14.792a2.946 2.946 0 01-2.084.875c-.805 0-1.493-.292-2.062-.875a2.823 2.823 0 01-.854-2.084c0-.805.285-1.493.854-2.062l5.416-5.417c.39-.39.854-.583 1.396-.583.542 0 1.007.194 1.396.583.39.39.584.854.584 1.396s-.195 1.007-.584 1.396l-5.416 5.417a.643.643 0 01-.48.194.643.643 0 01-.479-.194.643.643 0 01-.193-.48c0-.194.064-.354.193-.479l5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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
              <path d="M3.333 16.667V4.167c0-.459.163-.851.488-1.179.325-.325.721-.488 1.179-.488h10c.459 0 .854.163 1.179.488.325.328.488.72.488 1.179v8.333c0 .459-.163.854-.488 1.179-.325.325-.72.488-1.179.488H6.667l-3.334 2.5Z" fill="currentColor"/>
            </svg>
          ),
          badge: "99",
        },
        {
          label: "Playground",
          href: "/playground",
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 13.333V4.167C2.5 3.25 3.25 2.5 4.167 2.5h8.333c.917 0 1.667.75 1.667 1.667v5c0 .917-.75 1.667-1.667 1.667H5.833L2.5 13.333Z" fill="currentColor"/>
              <path d="M6.667 12.5v1.667c0 .916.75 1.666 1.666 1.666h5.834L17.5 18.333V9.167c0-.917-.75-1.667-1.667-1.667h-1.666" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          ),
        },
        {
          label: "Histórico de alterações",
          href: "/history",
          icon: (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8.75" cy="8.75" r="5.417" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M14.167 14.167l3.333 3.333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M5.833 8.75h1.25l1.25-2.5 1.667 5 1.25-2.5H12.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
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
            className={`w-full bg-[#1a1a1a] border border-[#1a1a1a] rounded-[12px] flex items-center gap-4 h-[50px] transition-colors hover:bg-[#252525] ${effectiveCollapsed ? 'justify-center px-2' : 'px-[9px]'}`}
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
                  <div className="text-[#f9f9f9] text-[12px] font-medium leading-tight font-['Inter']">
                    {selectedOrganization?.name ?? "Organização"}
                  </div>
                  <div className="text-[#b8b8b8] text-[10px] font-normal leading-tight font-['Inter']">
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
                <span className="text-[#5e5e5e] text-[12px] font-normal font-['Inter']">
                  {section.title}
                </span>
              </div>
            )}
            <div className="space-y-[2px]">
              {section.items.map((item) => {
                const isKnowledgeOSItem = item.href === "/knowledge-os";
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={isKnowledgeOSItem ? () => setIsCollapsed(true) : undefined}
                    className={`flex items-center h-10 rounded-[12px] transition-all ${
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
                        <span className={`flex-1 text-[16px] font-['Inter'] ${active ? 'font-medium leading-[1.2]' : 'font-normal leading-[1.6] tracking-[-0.32px]'}`}>{item.label}</span>
                        {item.badge && (
                          <span className="flex items-center gap-1 bg-[#1a1a1a] text-[#f9f9f9] text-[10px] font-normal px-1 py-0.5 rounded-[4px] leading-[1.3] font-['Inter']">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
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
          className={`flex items-center h-10 rounded-[12px] transition-all ${
            effectiveCollapsed ? 'justify-center px-2' : 'gap-3 px-3'
          } ${
            pathname === '/settings'
              ? "bg-white text-[#0c1421]"
              : "text-[#999] hover:bg-[#1a1a1a] hover:text-white"
          }`}
          title={effectiveCollapsed ? "Configurações" : undefined}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 5h4.375M9.375 5H17.5M2.5 10h8.125M13.125 10H17.5M2.5 15h2.083M7.083 15H17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="7.917" cy="5" r="1.458" fill="currentColor"/>
            <circle cx="12.083" cy="10" r="1.458" fill="currentColor"/>
            <circle cx="5.625" cy="15" r="1.458" fill="currentColor"/>
          </svg>
          {!effectiveCollapsed && <span className={`text-[16px] font-['Inter'] ${pathname === '/settings' ? 'font-medium leading-[1.2]' : 'font-normal leading-[1.6] tracking-[-0.32px]'}`}>Configurações</span>}
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
